import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { usePreviousHotkeysScope } from '@/hotkeys/hooks/internal/usePreviousHotkeysScope';
import { useSetHotkeysScope } from '@/hotkeys/hooks/useSetHotkeysScope';
import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { useBoardCardField } from '../hooks/useBoardCardField';

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
  editHotkeysScope?: HotkeysScope;
};

export function BoardCardEditableFieldInternal({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeysScope,
}: OwnProps) {
  const { openBoardCardField, isBoardCardFieldInEditMode } =
    useBoardCardField();

  const { closeBoardCardField } = useBoardCardField();

  const {
    goBackToPreviousHotkeysScope,
    setHotkeysScopeAndMemorizePreviousScope,
  } = usePreviousHotkeysScope();

  function handleOnClick() {
    if (!isBoardCardFieldInEditMode) {
      openBoardCardField();
      setHotkeysScopeAndMemorizePreviousScope(
        editHotkeysScope?.scope ?? InternalHotkeysScope.BoardCardFieldEditMode,
        editHotkeysScope?.customScopes ?? {},
      );
    }
  }

  function handleEditModeExit() {
    goBackToPreviousHotkeysScope();
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
