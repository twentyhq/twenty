import { ReactElement } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { useIsSoftFocusOnCurrentCell } from './hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from './hooks/useSetSoftFocusOnCurrentCell';
import { isEditModeScopedState } from './states/isEditModeScopedState';
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
};

export function EditableCell({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
}: OwnProps) {
  const [isEditMode] = useRecoilScopedState(isEditModeScopedState);

  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { closeEditableCell, openEditableCell } = useEditableCell();

  // TODO: we might have silent problematic behavior because of the setTimeout in openEditableCell, investigate
  // Maybe we could build a switchEditableCell to handle the case where we go from one cell to another.
  // See https://github.com/twentyhq/twenty/issues/446
  function handleOnClick() {
    openEditableCell();
    setSoftFocusOnCurrentCell();
  }

  function handleOnOutsideClick() {
    closeEditableCell();
  }

  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

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
      ) : hasSoftFocus ? (
        <EditableCellSoftFocusMode>
          {nonEditModeContent}
        </EditableCellSoftFocusMode>
      ) : (
        <EditableCellDisplayMode>{nonEditModeContent}</EditableCellDisplayMode>
      )}
    </CellBaseContainer>
  );
}
