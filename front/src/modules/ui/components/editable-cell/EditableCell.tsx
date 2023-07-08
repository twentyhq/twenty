import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { useAddToHotkeysScopeStack } from '@/hotkeys/hooks/useAddToHotkeysScopeStack';
import { HotkeysScopeStackItem } from '@/hotkeys/types/internal/HotkeysScopeStackItems';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { useCurrentCellEditMode } from './hooks/useCurrentCellEditMode';
import { useIsSoftFocusOnCurrentCell } from './hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from './hooks/useSetSoftFocusOnCurrentCell';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';
import { EditableCellEditMode } from './EditableCellEditMode';
import { EditableCellSoftFocusMode } from './EditableCellSoftFocusMode';

export const CellBaseContainer = styled.div`
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

export function EditableCell({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeysScope,
}: OwnProps) {
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();

  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { openEditableCell } = useEditableCell();

  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

  const addToHotkeysScopeStack = useAddToHotkeysScopeStack();

  // TODO: we might have silent problematic behavior because of the setTimeout in openEditableCell, investigate
  // Maybe we could build a switchEditableCell to handle the case where we go from one cell to another.
  // See https://github.com/twentyhq/twenty/issues/446
  function handleOnClick() {
    if (isCurrentCellInEditMode) {
      return;
    }

    if (hasSoftFocus) {
      openEditableCell();
      addToHotkeysScopeStack(
        editHotkeysScope ?? {
          scope: InternalHotkeysScope.CellEditMode,
        },
      );
    }

    setSoftFocusOnCurrentCell();
  }

  return (
    <CellBaseContainer onClick={handleOnClick}>
      {isCurrentCellInEditMode ? (
        <EditableCellEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
        >
          {editModeContent}
        </EditableCellEditMode>
      ) : hasSoftFocus ? (
        <EditableCellSoftFocusMode editHotkeysScope={editHotkeysScope}>
          {nonEditModeContent}
        </EditableCellSoftFocusMode>
      ) : (
        <EditableCellDisplayMode>{nonEditModeContent}</EditableCellDisplayMode>
      )}
    </CellBaseContainer>
  );
}
