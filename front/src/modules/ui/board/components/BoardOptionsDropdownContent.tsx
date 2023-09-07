import { useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { v4 } from 'uuid';

import { DropdownMenuHeader } from '@/ui/dropdown/components/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import {
  IconChevronLeft,
  IconChevronRight,
  IconLayoutKanban,
  IconPlus,
  IconSettings,
} from '@/ui/icon';
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

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: auto;
`;

enum BoardOptionsMenu {
  StageCreation = 'StageCreation',
  Stages = 'Stages',
}

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

    const columnToCreate = {
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
            <DropdownMenuItem
              onClick={() => setCurrentMenu(BoardOptionsMenu.Stages)}
            >
              <IconLayoutKanban size={theme.icon.size.md} />
              Stages
              <StyledIconChevronRight size={theme.icon.size.sm} />
            </DropdownMenuItem>
          </StyledDropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === BoardOptionsMenu.Stages && (
        <>
          <DropdownMenuHeader
            startIcon={<IconChevronLeft size={theme.icon.size.md} />}
            onClick={resetMenu}
          >
            Stages
          </DropdownMenuHeader>
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <DropdownMenuItem
              onClick={() => setCurrentMenu(BoardOptionsMenu.StageCreation)}
            >
              <IconPlus size={theme.icon.size.md} />
              Add stage
            </DropdownMenuItem>
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
