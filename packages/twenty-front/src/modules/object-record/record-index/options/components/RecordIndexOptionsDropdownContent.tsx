import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { useRecordIndexOptionsForTable } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForTable';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useSpreadsheetRecordImport } from '@/object-record/spreadsheet-import/useSpreadsheetRecordImport';
import {
  IconBaselineDensitySmall,
  IconChevronLeft,
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

type RecordIndexOptionsMenu = 'fields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectNameSingular: string;
  viewType: ViewType;
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
