import { useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import {
  IconChevronLeft,
  IconLayoutKanban,
  IconPlus,
  IconSettings,
} from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemNavigate } from '@/ui/menu-item/components/MenuItemNavigate';
import { ThemeColor } from '@/ui/theme/constants/colors';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { boardColumnsState } from '../states/boardColumnsState';
import type { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

type BoardOptionsDropdownContentProps = {
  customHotkeyScope: HotkeyScope;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
};

const StyledIconSettings = styled(IconSettings)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

enum BoardOptionsMenu {
  StageCreation = 'StageCreation',
  Stages = 'Stages',
}

type ColumnForCreate = {
  id: string;
  colorCode: ThemeColor;
  index: number;
  title: string;
};

export function BoardOptionsDropdownContent({
  customHotkeyScope,
  onStageAdd,
}: BoardOptionsDropdownContentProps) {
  const theme = useTheme();

  const stageInputRef = useRef<HTMLInputElement>(null);

  const [currentMenu, setCurrentMenu] = useState<
    BoardOptionsMenu | undefined
  >();

  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const resetMenu = () => setCurrentMenu(undefined);

  const handleStageSubmit = () => {
    if (
      currentMenu !== BoardOptionsMenu.StageCreation ||
      !stageInputRef?.current?.value
    )
      return;

    const columnToCreate: ColumnForCreate = {
      id: v4(),
      colorCode: 'gray',
      index: boardColumns.length,
      title: stageInputRef.current.value,
    };

    setBoardColumns((previousBoardColumns) => [
      ...previousBoardColumns,
      columnToCreate,
    ]);
    onStageAdd?.(columnToCreate);
  };

  const { closeDropdownButton } = useDropdownButton({
    key: BoardOptionsDropdownKey,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeDropdownButton();
    },
    customHotkeyScope.scope,
  );

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleStageSubmit();
      closeDropdownButton();
    },
    customHotkeyScope.scope,
  );

  return (
    <StyledDropdownMenu>
      {!currentMenu && (
        <>
          <DropdownMenuHeader>
            <StyledIconSettings size={theme.icon.size.md} />
            Settings
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => setCurrentMenu(BoardOptionsMenu.Stages)}
              LeftIcon={IconLayoutKanban}
              text="Stages"
            />
          </StyledDropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === BoardOptionsMenu.Stages && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Stages
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <MenuItem
              onClick={() => setCurrentMenu(BoardOptionsMenu.StageCreation)}
              LeftIcon={IconPlus}
              text="Add stage"
            />
          </StyledDropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === BoardOptionsMenu.StageCreation && (
        <DropdownMenuInput
          autoFocus
          placeholder="New stage"
          ref={stageInputRef}
        />
      )}
    </StyledDropdownMenu>
  );
}
