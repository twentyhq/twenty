import { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useCreateCompanyProgress } from '@/companies/hooks/useCreateCompanyProgress';
import { useFilteredSearchCompanyQuery } from '@/companies/hooks/useFilteredSearchCompanyQuery';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconPencil, IconPlus } from '@/ui/icon';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { icon } from '@/ui/theme/constants/icon';
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
  color: string;
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
            <DropdownMenuSelectableItem onClick={() => setMenu('title')}>
              <IconPencil size={icon.size.md} stroke={icon.stroke.sm} />
              Rename
            </DropdownMenuSelectableItem>
            <DropdownMenuSelectableItem onClick={() => setMenu('add')}>
              <IconPlus size={icon.size.md} stroke={icon.stroke.sm} />
              New opportunity
            </DropdownMenuSelectableItem>
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
