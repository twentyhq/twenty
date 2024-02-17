import { useEffect, useRef, useState } from 'react';
import { json2csv } from 'json-2-csv';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { useRecordIndexOptionsForTable } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForTable';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useSpreadsheetRecordImport } from '@/object-record/spreadsheet-import/useSpreadsheetRecordImport';
import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconFileExport,
  IconFileImport,
  IconTag,
} from '@/ui/display/icon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemToggle } from '@/ui/navigation/menu-item/components/MenuItemToggle';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewType } from '@/views/types/ViewType';

import { useFindManyParams } from '../../hooks/useLoadRecordIndexTable';

type RecordIndexOptionsMenu = 'fields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectNameSingular: string;
  viewType: ViewType;
};

type UseExportTableDataOptions = {
  delayMs: number;
  filename: string;
  limit: number;
  objectNameSingular: string;
  recordIndexId: string;
};

const useExportTableData = ({
  delayMs,
  filename,
  limit,
  objectNameSingular,
  recordIndexId,
}: UseExportTableDataOptions) => {
  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { getVisibleTableColumnsSelector } =
    useRecordTableStates(recordIndexId);
  const params = useFindManyParams(objectNameSingular);
  const columns = useRecoilValue(getVisibleTableColumnsSelector());
  const keys = columns.map((col) => ({
    field: col.metadata.fieldName,
    title: col.label,
  }));

  const { totalCount, records, fetchMoreRecords } = useFindManyRecords({
    ...params,
    onCompleted: (_data, { hasNextPage }) => {
      setHasNextPage(hasNextPage);
    },
  });

  const [inflight, setInflight] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (!isDownloading) {
      return;
    }

    if (!hasNextPage || pageCount >= limit) {
      const csv = json2csv(records, { keys });
      const blob = new Blob([csv], { type: 'text/csv' });
      setProgress(100);
      download(blob, filename);
      setIsDownloading(false);
      setProgress(undefined);
      return;
    }

    if (inflight) {
      return;
    }

    const CONVERSION_PERCENT_CONSTANT = 10;
    const PAGE_SIZE = 30;
    const maximumRequests = Math.max(100, totalCount / PAGE_SIZE);
    const percentOfRequestsCompleted = pageCount / maximumRequests;
    const progress = Math.round(
      (100 - CONVERSION_PERCENT_CONSTANT) * percentOfRequestsCompleted,
    );

    const downloadNextPage = async () => {
      setInflight(true);
      await fetchMoreRecords();
      setPageCount((state) => state + 1);
      setProgress(progress);
      await sleep(delayMs);
      setInflight(false);
    };

    downloadNextPage();
  }, [
    delayMs,
    fetchMoreRecords,
    filename,
    hasNextPage,
    inflight,
    isDownloading,
    keys,
    limit,
    pageCount,
    records,
    totalCount,
  ]);

  return { progress, download: () => setIsDownloading(true) };
};

export const RecordIndexOptionsDropdownContent = ({
  viewType,
  recordIndexId,
  objectNameSingular,
}: RecordIndexOptionsDropdownContentProps) => {
  const { setViewEditMode, handleViewNameSubmit } = useViewBar({
    viewBarId: recordIndexId,
  });
  const { viewEditModeState, currentViewSelector } = useViewScopedStates();

  const viewEditMode = useRecoilValue(viewEditModeState);
  const currentView = useRecoilValue(currentViewSelector);
  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

  const [currentMenu, setCurrentMenu] = useState<
    RecordIndexOptionsMenu | undefined
  >(undefined);

  const resetMenu = () => setCurrentMenu(undefined);

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const handleSelectMenu = (option: RecordIndexOptionsMenu) => {
    setCurrentMenu(option);
  };

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      const name = viewEditInputRef.current?.value;
      handleViewNameSubmit(name);
      resetMenu();
      setViewEditMode('none');
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const {
    handleColumnVisibilityChange,
    handleReorderColumns,
    visibleTableColumns,
    hiddenTableColumns,
  } = useRecordIndexOptionsForTable(recordIndexId);

  const {
    visibleBoardFields,
    hiddenBoardFields,
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    isCompactModeActive,
    setAndPersistIsCompactModeActive,
  } = useRecordIndexOptionsForBoard({
    objectNameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const visibleRecordFields =
    viewType === ViewType.Kanban ? visibleBoardFields : visibleTableColumns;

  const hiddenRecordFields =
    viewType === ViewType.Kanban ? hiddenBoardFields : hiddenTableColumns;

  const handleReorderFields =
    viewType === ViewType.Kanban
      ? handleReorderBoardFields
      : handleReorderColumns;

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : handleColumnVisibilityChange;

  const { openRecordSpreadsheetImport } =
    useSpreadsheetRecordImport(objectNameSingular);

  const { progress, download } = useExportTableData({
    delayMs: 100,
    filename: `${objectNameSingular}.csv`,
    limit: 100,
    objectNameSingular,
    recordIndexId,
  });

  return (
    <>
      {!currentMenu && (
        <>
          <DropdownMenuInput
            ref={viewEditInputRef}
            autoFocus={viewEditMode !== 'none'}
            placeholder={
              viewEditMode === 'create'
                ? 'New view'
                : viewEditMode === 'edit'
                  ? 'View name'
                  : ''
            }
            defaultValue={viewEditMode === 'create' ? '' : currentView?.name}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItem
              onClick={() => handleSelectMenu('fields')}
              LeftIcon={IconTag}
              text="Fields"
            />
            <MenuItem
              onClick={() => openRecordSpreadsheetImport()}
              LeftIcon={IconFileImport}
              text="Import"
            />
            <MenuItem
              onClick={download}
              LeftIcon={IconFileExport}
              text={progress === undefined ? `Export` : `Export (${progress}%)`}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'fields' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Fields
          </DropdownMenuHeader>
          <DropdownMenuSeparator />
          <ViewFieldsVisibilityDropdownSection
            title="Visible"
            fields={visibleRecordFields}
            isDraggable
            onDragEnd={handleReorderFields}
            onVisibilityChange={handleChangeFieldVisibility}
          />
          {hiddenRecordFields.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <ViewFieldsVisibilityDropdownSection
                title="Hidden"
                fields={hiddenRecordFields}
                isDraggable={false}
                onVisibilityChange={handleChangeFieldVisibility}
              />
            </>
          )}
        </>
      )}
      {viewType === ViewType.Kanban && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemToggle
              LeftIcon={IconBaselineDensitySmall}
              onToggleChange={() =>
                setAndPersistIsCompactModeActive(
                  !isCompactModeActive,
                  currentView,
                )
              }
              toggled={isCompactModeActive}
              text="Compact view"
              toggleSize="small"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </>
  );
};
