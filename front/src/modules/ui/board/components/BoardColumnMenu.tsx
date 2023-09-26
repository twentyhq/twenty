import { useCallback, useRef, useState } from 'react';
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
  left: 26.5px;
  position: absolute;
  top: 40px;
  width: 200px;
  z-index: 1;
`;

type OwnProps = {
  color: ThemeColor;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onTitleEdit: (title: string, color: string) => void;
  stageId: string;
  title: string;
};

type Menu = 'actions' | 'add' | 'title';

export const BoardColumnMenu = ({
  color,
  onClose,
  onDelete,
  onTitleEdit,
  stageId,
  title,
}: OwnProps) => {
  const [currentMenu, setCurrentMenu] = useState('actions');

  const boardColumnMenuRef = useRef(null);

  const { enqueueSnackBar } = useSnackBar();
  const createCompanyProgress = useCreateCompanyProgress();

  const handleCompanySelected = (
    selectedCompany: EntityForSelect | null | undefined,
  ) => {
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
  };

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeMenu = useCallback(() => {
    goBackToPreviousHotkeyScope();
    onClose();
  }, [goBackToPreviousHotkeyScope, onClose]);

  const setMenu = (menu: Menu) => {
    if (menu === 'add') {
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
    setCurrentMenu(menu);
  };
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const companies = useFilteredSearchCompanyQuery({
    searchFilter: relationPickerSearchFilter,
  });

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
      <StyledDropdownMenu data-select-disable>
        {currentMenu === 'actions' && (
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={() => setMenu('title')}
              LeftIcon={IconPencil}
              text="Edit"
            />
            <MenuItem
              onClick={() => setMenu('add')}
              LeftIcon={IconPlus}
              text="New opportunity"
            />
          </StyledDropdownMenuItemsContainer>
        )}
        {currentMenu === 'title' && (
          <BoardColumnEditTitleMenu
            color={color}
            onClose={closeMenu}
            onTitleEdit={onTitleEdit}
            title={title}
            onDelete={onDelete}
            stageId={stageId}
          />
        )}
        {currentMenu === 'add' && (
          <SingleEntitySelect
            disableBackgroundBlur
            entitiesToSelect={companies.entitiesToSelect}
            loading={companies.loading}
            onCancel={closeMenu}
            onEntitySelected={handleCompanySelected}
            selectedEntity={companies.selectedEntities[0]}
          />
        )}
      </StyledDropdownMenu>
    </StyledMenuContainer>
  );
};
