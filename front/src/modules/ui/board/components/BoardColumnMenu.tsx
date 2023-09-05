import { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useCreateCompanyProgress } from '@/companies/hooks/useCreateCompanyProgress';
import { useFilteredSearchCompanyQuery } from '@/companies/hooks/useFilteredSearchCompanyQuery';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconPencil, IconPlus, IconTrash } from '@/ui/icon';
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

import { boardColumnsState } from '../states/boardColumnsState';
import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { BoardColumnEditTitleMenu } from './BoardColumnEditTitleMenu';

const StyledMenuContainer = styled.div`
  position: absolute;
  width: 200px;
  z-index: 1;
`;

type OwnProps = {
  color: string;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onTitleEdit: (title: string, color: string) => void;
  stageId: string;
  title: string;
};

type Menu = 'actions' | 'add' | 'title';

export function BoardColumnMenu({
  color,
  onClose,
  onDelete,
  onTitleEdit,
  stageId,
  title,
}: OwnProps) {
  const [currentMenu, setCurrentMenu] = useState('actions');

  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

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

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeMenu = useCallback(() => {
    goBackToPreviousHotkeyScope();
    onClose();
  }, [goBackToPreviousHotkeyScope, onClose]);

  const handleDelete = useCallback(() => {
    setBoardColumns((previousBoardColumns) =>
      previousBoardColumns.filter((column) => column.id !== stageId),
    );
    onDelete?.(stageId);
    closeMenu();
  }, [closeMenu, onDelete, setBoardColumns, stageId]);

  function setMenu(menu: Menu) {
    if (menu === 'add') {
      setHotkeyScopeAndMemorizePreviousScope(
        RelationPickerHotkeyScope.RelationPicker,
      );
    }
    setCurrentMenu(menu);
  }
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const searchFilter = relationPickerSearchFilter;
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
        {currentMenu === 'actions' && (
          <StyledDropdownMenuItemsContainer>
            <DropdownMenuSelectableItem onClick={() => setMenu('title')}>
              <IconPencil size={icon.size.md} stroke={icon.stroke.sm} />
              Rename
            </DropdownMenuSelectableItem>
            <DropdownMenuSelectableItem
              disabled={boardColumns.length <= 1}
              onClick={handleDelete}
            >
              <IconTrash size={icon.size.md} stroke={icon.stroke.sm} />
              Delete
            </DropdownMenuSelectableItem>
            <DropdownMenuSelectableItem onClick={() => setMenu('add')}>
              <IconPlus size={icon.size.md} stroke={icon.stroke.sm} />
              New opportunity
            </DropdownMenuSelectableItem>
          </StyledDropdownMenuItemsContainer>
        )}
        {currentMenu === 'title' && (
          <BoardColumnEditTitleMenu
            color={color}
            onClose={closeMenu}
            onTitleEdit={onTitleEdit}
            title={title}
          />
        )}
        {currentMenu === 'add' && (
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
