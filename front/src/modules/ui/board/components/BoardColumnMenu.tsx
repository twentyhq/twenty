import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useCreateCompanyProgress } from '@/companies/hooks/useCreateCompanyProgress';
import { useFilteredSearchCompanyQuery } from '@/companies/hooks/useFilteredSearchCompanyQuery';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconPencil, IconPlus } from '@/ui/icon';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { BoardColumnEditTitleMenu } from './BoardColumnEditTitleMenu';

const StyledMenuContainer = styled.div`
  position: absolute;
  width: 200px;
  z-index: 1;
`;

type OwnProps = {
  onClose: () => void;
  title: string;
  color: ThemeColor;
  onTitleEdit: (title: string, color: string) => void;
  stageId: string;
};

export function BoardColumnMenu({
  onClose,
  onTitleEdit,
  title,
  color,
  stageId,
}: OwnProps) {
  const [openMenu, setOpenMenu] = useState('actions');
  const boardColumnMenuRef = useRef(null);
  const { enqueueSnackBar } = useSnackBar();
  const createCompanyProgress = useCreateCompanyProgress();

  function handleCompanySelected(
    selectedCompany: EntityForSelect | null | undefined,
  ) {
    if (!selectedCompany?.id) {
      enqueueSnackBar(
        'There was a problem with the company selection, please retry.',
        {
          variant: 'error',
        },
      );

      console.error(
        'There was a problem with the company selection, please retry.',
      );
      return;
    }

    createCompanyProgress(selectedCompany.id, stageId);
    closeMenu();
  }

  function closeMenu() {
    goBackToPreviousHotkeyScope();
    onClose();
  }

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function setMenu(menu: string) {
    if (menu === 'add') {
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
    setOpenMenu(menu);
  }
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const companies = useFilteredSearchCompanyQuery({ searchFilter });

  useListenClickOutside({
    refs: [boardColumnMenuRef],
    callback: closeMenu,
  });

  useScopedHotkeys(
    [Key.Escape, Key.Enter],
    closeMenu,
    BoardColumnHotkeyScope.BoardColumn,
    [],
  );

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      <StyledDropdownMenu>
        {openMenu === 'actions' && (
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={() => setMenu('title')}
              LeftIcon={IconPencil}
              text="Rename"
            />
            <MenuItem
              onClick={() => setMenu('add')}
              LeftIcon={IconPlus}
              text="New opportunity"
            />
          </StyledDropdownMenuItemsContainer>
        )}
        {openMenu === 'title' && (
          <BoardColumnEditTitleMenu
            color={color}
            onClose={closeMenu}
            onTitleEdit={onTitleEdit}
            title={title}
          />
        )}

        {openMenu === 'add' && (
          <SingleEntitySelect
            onEntitySelected={(value) => handleCompanySelected(value)}
            onCancel={closeMenu}
            entities={{
              entitiesToSelect: companies.entitiesToSelect,
              selectedEntity: companies.selectedEntities[0],
              loading: companies.loading,
            }}
            disableBackgroundBlur={true}
          />
        )}
      </StyledDropdownMenu>
    </StyledMenuContainer>
  );
}
