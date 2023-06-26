import { ReactElement } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { isNonTextWritingKey } from '@/utils/hotkeys/isNonTextWritingKey';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { useIsSoftFocusOnCurrentCell } from './hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from './hooks/useSetSoftFocusOnCurrentCell';
import { isEditModeScopedState } from './states/isEditModeScopedState';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';
import { EditableCellEditMode } from './EditableCellEditMode';

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
};

export function EditableCell({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
}: OwnProps) {
  const [isEditMode] = useRecoilScopedState(isEditModeScopedState);

  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { moveDown } = useMoveSoftFocus();

  const { closeEditableCell, openEditableCell } = useEditableCell();

  function handleOnClick() {
    openEditableCell();
    setSoftFocusOnCurrentCell();
  }

  function handleOnOutsideClick() {
    closeEditableCell();
  }

  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

  // TODO: create a component to wrap soft focus mode to avoid having to mount those useHotkeys hooks on all cells.
  useHotkeys(
    'enter',
    () => {
      if (hasSoftFocus) {
        if (isEditMode) {
          closeEditableCell();
          moveDown();
        } else {
          openEditableCell();
        }
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isEditMode, closeEditableCell, hasSoftFocus],
  );

  useHotkeys(
    '*',
    (keyboardEvent) => {
      if (hasSoftFocus && !isEditMode) {
        const isTextWritingKey = !isNonTextWritingKey(keyboardEvent.key);

        if (!isEditMode && isTextWritingKey) {
          openEditableCell();
        } else {
          keyboardEvent.preventDefault();
        }
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: false,
    },
  );

  return (
    <CellBaseContainer onClick={handleOnClick}>
      {isEditMode ? (
        <EditableCellEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
          onOutsideClick={handleOnOutsideClick}
        >
          {editModeContent}
        </EditableCellEditMode>
      ) : (
        <EditableCellDisplayMode>{nonEditModeContent}</EditableCellDisplayMode>
      )}
    </CellBaseContainer>
  );
}
