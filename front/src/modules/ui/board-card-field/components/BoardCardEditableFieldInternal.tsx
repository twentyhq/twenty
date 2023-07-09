import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { useAddToHotkeysScopeStack } from '@/hotkeys/hooks/useAddToHotkeysScopeStack';
import { HotkeysScopeStackItem } from '@/hotkeys/types/internal/HotkeysScopeStackItems';
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
  editHotkeysScope?: HotkeysScopeStackItem;
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

  const addToHotkeysScopeStack = useAddToHotkeysScopeStack();

  function handleOnClick() {
    if (!isBoardCardFieldInEditMode) {
      openBoardCardField();
      addToHotkeysScopeStack(
        editHotkeysScope ?? {
          scope: InternalHotkeysScope.BoardCardFieldEditMode,
        },
      );
    }
  }

  return (
    <BoardCardFieldContainer onClick={handleOnClick}>
      {isBoardCardFieldInEditMode ? (
        <BoardCardEditableFieldEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
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
