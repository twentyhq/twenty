import { useCallback, useRef, useState } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
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

import { useTableColumns } from '../../hooks/useTableColumns';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

type TableOptionsMenu = 'fields';

export const TableOptionsDropdownContent = ({
  onImport,
  recordTableId,
}: {
  onImport?: () => void;
  recordTableId: string;
}) => {
  const { setViewEditMode, handleViewNameSubmit } = useViewBar();
  const { viewEditModeState, currentViewSelector } = useViewScopedStates();

  const viewEditMode = useRecoilValue(viewEditModeState);
  const currentView = useRecoilValue(currentViewSelector);
  const { closeDropdown } = useDropdown();

  const [currentMenu, setCurrentMenu] = useState<TableOptionsMenu | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const { hiddenTableColumnsScopeInjector, visibleTableColumnsScopeInjector } =
    getRecordTableScopeInjector();

  const { injectSelectorWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableId);

  const hiddenTableColumnsSelector = injectSelectorWithRecordTableScopeId(
    hiddenTableColumnsScopeInjector,
  );

  const visibleTableColumnsSelector = injectSelectorWithRecordTableScopeId(
    visibleTableColumnsScopeInjector,
  );

  const hiddenTableColumns = useRecoilValue(hiddenTableColumnsSelector);
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

  const { handleColumnVisibilityChange, handleColumnReorder } = useTableColumns(
    { recordTableScopeId: recordTableId },
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
    Key.Escape,
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
            {onImport && (
              <MenuItem
                onClick={onImport}
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
