import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconChevronLeft, IconFileImport, IconTag } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useUpsertView } from '@/ui/view-bar/hooks/useUpsertView';
import { viewsByIdScopedSelector } from '@/ui/view-bar/states/selectors/viewsByIdScopedSelector';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';

import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { hiddenTableColumnsScopedSelector } from '../../states/selectors/hiddenTableColumnsScopedSelector';
import { visibleTableColumnsScopedSelector } from '../../states/selectors/visibleTableColumnsScopedSelector';
import { TableOptionsDropdownKey } from '../../types/TableOptionsDropdownKey';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

import { TableOptionsDropdownColumnVisibility } from './TableOptionsDropdownSection';

type TableOptionsDropdownButtonProps = {
  onImport?: () => void;
};

type TableOptionsMenu = 'properties';

export function TableOptionsDropdownContent({
  onImport,
}: TableOptionsDropdownButtonProps) {
  const { closeDropdownButton } = useDropdownButton({
    key: TableOptionsDropdownKey,
  });

  const [selectedMenu, setSelectedMenu] = useState<
    TableOptionsMenu | undefined
  >(undefined);

  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const viewEditMode = useRecoilValue(viewEditModeState);
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

  const { upsertView } = useUpsertView({
    scopeContext: TableRecoilScopeContext,
  });

  const handleViewNameSubmit = async () => {
    const name = viewEditInputRef.current?.value;
    await upsertView(name);
  };

  const handleSelectMenu = (option: TableOptionsMenu) => {
    handleViewNameSubmit();
    setSelectedMenu(option);
  };

  const resetMenu = () => setSelectedMenu(undefined);

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeDropdownButton();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleViewNameSubmit();
      resetMenu();
      closeDropdownButton();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  return (
    <StyledDropdownMenu>
      {!selectedMenu && (
        <>
          {!!viewEditMode.mode ? (
            <DropdownMenuInput
              ref={viewEditInputRef}
              autoFocus
              placeholder={
                viewEditMode.mode === 'create' ? 'New view' : 'View name'
              }
              defaultValue={
                viewEditMode.viewId
                  ? viewsById[viewEditMode.viewId]?.name
                  : undefined
              }
            />
          ) : (
            <DropdownMenuHeader>View settings</DropdownMenuHeader>
          )}
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={() => handleSelectMenu('properties')}
              LeftIcon={IconTag}
              text="Properties"
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
      {selectedMenu === 'properties' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Properties
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <TableOptionsDropdownColumnVisibility
            title="Visible"
            columns={visibleTableColumns}
          />
          {hiddenTableColumns.length > 0 && (
            <>
              <StyledDropdownMenuSeparator />
              <TableOptionsDropdownColumnVisibility
                title="Hidden"
                columns={hiddenTableColumns}
              />
            </>
          )}
        </>
      )}
    </StyledDropdownMenu>
  );
}
