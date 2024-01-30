import { useCallback, useRef, useState } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useTableColumns } from '@/object-record/record-table/hooks/useTableColumns';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useSpreadsheetPersonImport } from '@/people/hooks/useSpreadsheetPersonImport';
import { IconChevronLeft, IconFileImport, IconTag } from '@/ui/display/icon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';

type TableOptionsMenu = 'fields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectNameSingular: string;
};

export const RecordIndexOptionsDropdownContent = ({
  recordIndexId,
  objectNameSingular,
}: RecordIndexOptionsDropdownContentProps) => {
  const { setViewEditMode, handleViewNameSubmit } = useViewBar();
  const { viewEditModeState, currentViewSelector } = useViewScopedStates();

  const viewEditMode = useRecoilValue(viewEditModeState);
  const currentView = useRecoilValue(currentViewSelector);
  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

  const [currentMenu, setCurrentMenu] = useState<TableOptionsMenu | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const { getHiddenTableColumnsSelector, getVisibleTableColumnsSelector } =
    useRecordTableStates(recordIndexId);

  const hiddenTableColumns = useRecoilValue(getHiddenTableColumnsSelector());
  const visibleTableColumns = useRecoilValue(getVisibleTableColumnsSelector());

  const { handleColumnVisibilityChange, handleColumnReorder } = useTableColumns(
    { recordTableId: recordIndexId },
  );

  const handleSelectMenu = (option: TableOptionsMenu) => {
    const name = viewEditInputRef.current?.value;
    handleViewNameSubmit(name);
    setCurrentMenu(option);
  };

  const handleReorderField: OnDragEndResponder = useCallback(
    (result) => {
      if (
        !result.destination ||
        result.destination.index === 1 ||
        result.source.index === 1
      ) {
        return;
      }

      const reorderFields = [...visibleTableColumns];
      const [removed] = reorderFields.splice(result.source.index - 1, 1);
      reorderFields.splice(result.destination.index - 1, 0, removed);

      handleColumnReorder(reorderFields);
    },
    [visibleTableColumns, handleColumnReorder],
  );

  const resetMenu = () => setCurrentMenu(undefined);

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

  const { openPersonSpreadsheetImport } = useSpreadsheetPersonImport();
  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const handleImport =
    CoreObjectNameSingular.Company === objectNameSingular
      ? openCompanySpreadsheetImport
      : CoreObjectNameSingular.Person === objectNameSingular
        ? openPersonSpreadsheetImport
        : undefined;

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
            {handleImport && (
              <MenuItem
                onClick={() => handleImport}
                LeftIcon={IconFileImport}
                text="Import"
              />
            )}
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
            fields={visibleTableColumns}
            isVisible={true}
            onVisibilityChange={handleColumnVisibilityChange}
            isDraggable={true}
            onDragEnd={handleReorderField}
          />
          {hiddenTableColumns.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <ViewFieldsVisibilityDropdownSection
                title="Hidden"
                fields={hiddenTableColumns}
                isVisible={false}
                onVisibilityChange={handleColumnVisibilityChange}
                isDraggable={false}
              />
            </>
          )}
        </>
      )}
    </>
  );
};
