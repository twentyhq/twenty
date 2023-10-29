import { useCallback, useRef, useState } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { Key } from 'ts-key-enum';

import { IconChevronLeft, IconFileImport, IconTag } from '@/ui/display/icon';
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
import { useViewGetStates } from '@/views/hooks/useViewGetStates';

import { useTableColumns } from '../../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

type TableOptionsMenu = 'fields';

export const TableOptionsDropdownContent = ({
  onImport,
}: {
  onImport?: () => void;
}) => {
  const { setViewEditMode, handleViewNameSubmit } = useView();
  const { viewEditMode, currentView } = useViewGetStates();

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
