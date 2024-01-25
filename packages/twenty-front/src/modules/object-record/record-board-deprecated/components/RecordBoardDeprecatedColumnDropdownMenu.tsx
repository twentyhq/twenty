import { useCallback, useContext, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { IconArrowLeft, IconArrowRight, IconPencil } from '@/ui/display/icon';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { BoardColumnContext } from '../contexts/BoardColumnContext';
import { useBoardColumnsInternal } from '../hooks/internal/useRecordBoardDeprecatedColumnsInternal';
import { BoardColumnHotkeyScope } from '../types/BoardColumnHotkeyScope';

import { RecordBoardDeprecatedColumnEditTitleMenu } from './RecordBoardDeprecatedColumnEditTitleMenu';
const StyledMenuContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(10)};
  width: 200px;
  z-index: 1;
`;

type RecordBoardDeprecatedColumnDropdownMenuProps = {
  onClose: () => void;
  onDelete?: (id: string) => void;
  stageId: string;
};

type Menu = 'actions' | 'add' | 'title';

export const RecordBoardDeprecatedColumnDropdownMenu = ({
  onClose,
  onDelete,
  stageId,
}: RecordBoardDeprecatedColumnDropdownMenuProps) => {
  const [currentMenu, setCurrentMenu] = useState('actions');
  const column = useContext(BoardColumnContext);

  const boardColumnMenuRef = useRef<HTMLDivElement>(null);

  const { handleMoveBoardColumn } = useBoardColumnsInternal();

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

  if (!column) return <></>;

  const { isFirstColumn, isLastColumn, columnDefinition } = column;

  const handleColumnMoveLeft = () => {
    closeMenu();
    if (isFirstColumn) {
      return;
    }
    handleMoveBoardColumn('left', columnDefinition);
  };

  const handleColumnMoveRight = () => {
    closeMenu();
    if (isLastColumn) {
      return;
    }
    handleMoveBoardColumn('right', columnDefinition);
  };

  return (
    <StyledMenuContainer ref={boardColumnMenuRef}>
      <DropdownMenu data-select-disable>
        {currentMenu === 'actions' && (
          <DropdownMenuItemsContainer>
            <MenuItem
              onClick={() => setMenu('title')}
              LeftIcon={IconPencil}
              text="Edit"
            />
            <MenuItem
              LeftIcon={IconArrowLeft}
              onClick={handleColumnMoveLeft}
              text="Move left"
            />
            <MenuItem
              LeftIcon={IconArrowRight}
              onClick={handleColumnMoveRight}
              text="Move right"
            />
            {/* <MenuItem
              onClick={() => setMenu('add')}
              LeftIcon={IconPlus}
              text="New opportunity"
            /> */}
          </DropdownMenuItemsContainer>
        )}
        {currentMenu === 'title' && (
          <RecordBoardDeprecatedColumnEditTitleMenu
            color={columnDefinition.colorCode ?? 'gray'}
            onClose={closeMenu}
            title={columnDefinition.title}
            onDelete={onDelete}
            stageId={stageId}
          />
        )}
        {currentMenu === 'add' && (
          <div>add</div>
          // <SingleEntitySelect
          //   disableBackgroundBlur
          //   entitiesToSelect={companies.entitiesToSelect}
          //   loading={companies.loading}
          //   onCancel={closeMenu}
          //   onEntitySelected={handleCompanySelected}
          //   selectedEntity={companies.selectedEntities[0]}
          // />
        )}
      </DropdownMenu>
    </StyledMenuContainer>
  );
};
