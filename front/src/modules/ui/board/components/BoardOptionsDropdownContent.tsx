import { type Context, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
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
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useUpsertView } from '@/ui/view-bar/hooks/useUpsertView';
import { viewsByIdScopedSelector } from '@/ui/view-bar/states/selectors/viewsByIdScopedSelector';
import { viewEditModeState } from '@/ui/view-bar/states/viewEditModeState';
import type { View } from '@/ui/view-bar/types/View';

import { boardColumnsState } from '../states/boardColumnsState';
import type { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

export type BoardOptionsDropdownContentProps = {
  customHotkeyScope: HotkeyScope;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
  onViewsChange?: (views: View[]) => void | Promise<void>;
  scopeContext: Context<string | null>;
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
  onViewsChange,
  scopeContext,
}: BoardOptionsDropdownContentProps) {
  const theme = useTheme();

  const stageInputRef = useRef<HTMLInputElement>(null);
  const viewEditInputRef = useRef<HTMLInputElement>(null);

  const [currentMenu, setCurrentMenu] = useState<
    BoardOptionsMenu | undefined
  >();

  const [boardColumns, setBoardColumns] = useRecoilState(boardColumnsState);

  const viewsById = useRecoilScopedValue(viewsByIdScopedSelector, scopeContext);
  const viewEditMode = useRecoilValue(viewEditModeState);

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

  const { upsertView } = useUpsertView({
    onViewsChange,
    scopeContext,
  });

  const handleViewNameSubmit = async () => {
    const name = viewEditInputRef.current?.value;
    await upsertView(name);
  };

  const resetMenu = () => setCurrentMenu(undefined);

  const handleMenuNavigate = (menu: BoardOptionsMenu) => {
    handleViewNameSubmit();
    setCurrentMenu(menu);
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
      handleViewNameSubmit();
      closeDropdownButton();
    },
    customHotkeyScope.scope,
  );

  return (
    <StyledDropdownMenu>
      {!currentMenu && (
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
            <DropdownMenuHeader>
              <StyledIconSettings size={theme.icon.size.md} />
              Settings
            </DropdownMenuHeader>
          )}
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => handleMenuNavigate(BoardOptionsMenu.Stages)}
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
