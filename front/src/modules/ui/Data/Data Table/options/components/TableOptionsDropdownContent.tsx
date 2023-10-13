import { useCallback, useContext, useRef, useState } from 'react';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback, useRecoilValue, useResetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { ViewFieldsVisibilityDropdownSection } from '@/ui/Data/View Bar/components/ViewFieldsVisibilityDropdownSection';
import { ViewBarContext } from '@/ui/Data/View Bar/contexts/ViewBarContext';
import { useUpsertView } from '@/ui/Data/View Bar/hooks/useUpsertView';
import { currentViewScopedSelector } from '@/ui/Data/View Bar/states/selectors/currentViewScopedSelector';
import { viewsByIdScopedSelector } from '@/ui/Data/View Bar/states/selectors/viewsByIdScopedSelector';
import { viewEditModeState } from '@/ui/Data/View Bar/states/viewEditModeState';
import { IconChevronLeft, IconFileImport, IconTag } from '@/ui/Display/Icon';
import { DropdownMenuHeader } from '@/ui/Layout/Dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/Layout/Dropdown/components/DropdownMenuInput';
import { DropdownMenuInputContainer } from '@/ui/Layout/Dropdown/components/DropdownMenuInputContainer';
import { DropdownMenuItemsContainer } from '@/ui/Layout/Dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenu } from '@/ui/Layout/Dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuSeparator } from '@/ui/Layout/Dropdown/components/StyledDropdownMenuSeparator';
import { useDropdown } from '@/ui/Layout/Dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/Navigation/Menu Item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

import { useTableColumns } from '../../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

type TableOptionsMenu = 'fields';

export const TableOptionsDropdownContent = () => {
  const scopeId = useRecoilScopeId(TableRecoilScopeContext);

  const { onImport } = useContext(ViewBarContext);
  const { closeDropdown } = useDropdown();

  const [currentMenu, setCurrentMenu] = useState<TableOptionsMenu | undefined>(
    undefined,
  );

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const currentView = useRecoilScopedValue(
    currentViewScopedSelector,
    TableRecoilScopeContext,
  );
  const viewEditMode = useRecoilValue(viewEditModeState);
  const resetViewEditMode = useResetRecoilState(viewEditModeState);
  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const hiddenTableColumns = useRecoilScopedValue(
    hiddenTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const viewsById = useRecoilScopedValue(
    viewsByIdScopedSelector,
    TableRecoilScopeContext,
  );

  const { handleColumnVisibilityChange, handleColumnReorder } =
    useTableColumns();

  const { upsertView } = useUpsertView();

  const handleViewNameSubmit = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const tableColumns = await snapshot.getPromise(
          tableColumnsScopedState(scopeId),
        );
        const isCreateMode = viewEditMode.mode === 'create';
        const name = viewEditInputRef.current?.value;
        const view = await upsertView(name);

        if (view && isCreateMode) {
          set(savedTableColumnsFamilyState(view.id), tableColumns);
        }
      },
    [scopeId, upsertView, viewEditMode.mode],
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
      resetViewEditMode();
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleViewNameSubmit();
      resetMenu();
      resetViewEditMode();
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  return (
    <StyledDropdownMenu>
      {!currentMenu && (
        <>
          <DropdownMenuInputContainer>
            <DropdownMenuInput
              ref={viewEditInputRef}
              autoFocus={
                viewEditMode.mode === 'create' || !!viewEditMode.viewId
              }
              placeholder={
                viewEditMode.mode === 'create' ? 'New view' : 'View name'
              }
              defaultValue={
                viewEditMode.mode === 'create'
                  ? ''
                  : viewEditMode.viewId
                  ? viewsById[viewEditMode.viewId]?.name
                  : currentView?.name
              }
            />
          </DropdownMenuInputContainer>
          <StyledDropdownMenuSeparator />
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
          <StyledDropdownMenuSeparator />
          <ViewFieldsVisibilityDropdownSection
            title="Visible"
            fields={visibleTableColumns}
            onVisibilityChange={handleColumnVisibilityChange}
            isDraggable={true}
            onDragEnd={handleReorderField}
          />
          {hiddenTableColumns.length > 0 && (
            <>
              <StyledDropdownMenuSeparator />
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
    </StyledDropdownMenu>
  );
};
