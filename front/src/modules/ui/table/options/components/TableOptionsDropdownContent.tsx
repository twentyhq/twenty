import { useContext, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useRecoilValue, useResetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconChevronLeft, IconFileImport, IconTag } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { rgba } from '@/ui/theme/constants/colors';
import { textInputStyle } from '@/ui/theme/constants/effects';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { ViewFieldsVisibilityDropdownSection } from '@/ui/view-bar/components/ViewFieldsVisibilityDropdownSection';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { useUpsertView } from '@/ui/view-bar/hooks/useUpsertView';
import { currentViewScopedSelector } from '@/ui/view-bar/states/selectors/currentViewScopedSelector';
import { viewsByIdScopedSelector } from '@/ui/view-bar/states/selectors/viewsByIdScopedSelector';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';
import { useTableColumns } from '../../hooks/useTableColumns';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

type TableOptionsMenu = 'fields';

const StyledInputContainer = styled.div`
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledViewNameInput = styled.input`
  ${textInputStyle}

  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 32px;
  position: relative;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0px 0px 0px 3px ${({ theme }) => rgba(theme.color.blue, 0.1)};
  }
`;

export function TableOptionsDropdownContent() {
  const scopeId = useRecoilScopeId(TableRecoilScopeContext);

  const { onImport } = useContext(ViewBarContext);
  const { closeDropdownButton } = useDropdownButton({
    dropdownId: TableOptionsDropdownId,
  });

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

  const { handleColumnVisibilityChange } = useTableColumns();

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

  const resetMenu = () => setCurrentMenu(undefined);

  useScopedHotkeys(
    Key.Escape,
    () => {
      resetViewEditMode();
      closeDropdownButton();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleViewNameSubmit();
      resetMenu();
      resetViewEditMode();
      closeDropdownButton();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  return (
    <StyledDropdownMenu>
      {!currentMenu && (
        <>
          <StyledInputContainer>
            <StyledViewNameInput
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
          </StyledInputContainer>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
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
          </StyledDropdownMenuItemsContainer>
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
          />
          {hiddenTableColumns.length > 0 && (
            <>
              <StyledDropdownMenuSeparator />
              <ViewFieldsVisibilityDropdownSection
                title="Hidden"
                fields={hiddenTableColumns}
                onVisibilityChange={handleColumnVisibilityChange}
              />
            </>
          )}
        </>
      )}
    </StyledDropdownMenu>
  );
}
