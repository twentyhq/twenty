import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { usePreviousHotkeyScope } from '@/ui/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';

import { useBoardCardField } from '../hooks/useBoardCardField';
import { BoardCardFieldHotkeyScope } from '../types/BoardCardFieldHotkeyScope';

import { BoardCardEditableFieldDisplayMode } from './BoardCardEditableFieldDisplayMode';
import { BoardCardEditableFieldEditMode } from './BoardCardEditableFieldEditMode';

export const BoardCardFieldContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
  width: 100%;
`;

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  editHotkeyScope?: HotkeyScope;
};

export function BoardCardEditableFieldInternal({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
}: OwnProps) {
  const { openBoardCardField, isBoardCardFieldInEditMode } =
    useBoardCardField();

  const { closeBoardCardField } = useBoardCardField();

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  function handleOnClick() {
    if (!isBoardCardFieldInEditMode) {
      openBoardCardField();
      setHotkeyScopeAndMemorizePreviousScope(
        editHotkeyScope?.scope ??
          BoardCardFieldHotkeyScope.BoardCardFieldEditMode,
        editHotkeyScope?.customScopes ?? {},
      );
    }
  }

  function handleEditModeExit() {
    goBackToPreviousHotkeyScope();
    closeBoardCardField();
  }

  return (
    <BoardCardFieldContainer onClick={handleOnClick}>
      {isBoardCardFieldInEditMode ? (
        <BoardCardEditableFieldEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
          onExit={handleEditModeExit}
        >
          {editModeContent}
        </BoardCardEditableFieldEditMode>
      ) : (
        <BoardCardEditableFieldDisplayMode>
          {nonEditModeContent}
        </BoardCardEditableFieldDisplayMode>
      )}
    </BoardCardFieldContainer>
  );
}
