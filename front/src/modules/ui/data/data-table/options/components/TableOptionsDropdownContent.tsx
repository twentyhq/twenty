import { useCallback, useRef, useState } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';
import { Key } from 'ts-key-enum';

import { IconChevronLeft, IconTag } from '@/ui/display/icon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { useView } from '@/views/hooks/useView';

import { useTableColumns } from '../../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

type TableOptionsMenu = 'fields';

export const TableOptionsDropdownContent = () => {
  const {
    viewEditMode,
    setViewEditMode,
    createView,
    currentViewFields,
    currentViewId,
    currentView,
  } = useView();

  const { closeDropdown } = useDropdown();

  const [currentMenu, setCurrentMenu] = useState<TableOptionsMenu | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );

  const { handleColumnVisibilityChange, handleColumnReorder } =
    useTableColumns();

  const handleViewNameSubmit = useRecoilCallback(
    ({ set }) =>
      async () => {
        const isCreateMode = viewEditMode === 'create';
        const name = viewEditInputRef.current?.value;

        if (isCreateMode && name && currentViewFields) {
          await createView(name);
          set(savedTableColumnsFamilyState(currentViewId), currentViewFields);
        }
      },
    [createView, currentViewFields, currentViewId, viewEditMode],
  );

  const handleSelectMenu = (option: TableOptionsMenu) => {
    handleViewNameSubmit();
    setCurrentMenu(option);
  };

  const handleReorderField: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination || result.destination.index === 0) {
        return;
      }

      const reorderFields = Array.from(visibleTableColumns);
      const [removed] = reorderFields.splice(result.source.index, 1);
      reorderFields.splice(result.destination.index, 0, removed);

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
      handleViewNameSubmit();
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
            defaultValue={
              viewEditMode === 'create'
                ? ''
                : viewEditMode === 'edit'
                ? currentView?.name
                : ''
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItem
              onClick={() => handleSelectMenu('fields')}
              LeftIcon={IconTag}
              text="Fields"
            />
            {/*onImport && (
              <MenuItem
                onClick={onImport}
                LeftIcon={IconFileImport}
                text="Import"
              />
            )*/}
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
