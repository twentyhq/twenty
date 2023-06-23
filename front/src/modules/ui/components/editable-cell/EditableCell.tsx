import { ReactElement } from 'react';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { isSomeInputInEditModeState } from '../../tables/states/isSomeInputInEditModeState';

import { useEditableCell } from './hooks/useCloseEditableCell';
import { useSoftFocusOnCurrentCell } from './hooks/useSoftFocusOnCurrentCell';
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
  const [isEditMode, setIsEditMode] = useRecoilScopedState(
    isEditModeScopedState,
  );
  const [isSomeInputInEditMode, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );

  const { enableScope, disableScope } = useHotkeysContext();

  const { closeEditableCell, openEditableCell } = useEditableCell();

  const [hasSoftFocus] = useSoftFocusOnCurrentCell();

  function handleOnClick() {
    openEditableCell();
  }

  function handleOnOutsideClick() {
    closeEditableCell();
  }

  useHotkeys(
    'esc',
    () => {
      if (hasSoftFocus && isEditMode) {
        closeEditableCell();
        enableScope('entity-table');
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isEditMode, closeEditableCell, hasSoftFocus, enableScope],
  );

  useHotkeys(
    'enter',
    () => {
      if (hasSoftFocus && !isSomeInputInEditMode) {
        setIsSomeInputInEditMode(true);
        setIsEditMode(true);
        disableScope('entity-table');
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isEditMode, closeEditableCell, hasSoftFocus, disableScope],
  );

  return (
    <CellBaseContainer onClick={handleOnClick}>
      {isEditMode ? (
        <EditableCellEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
          isEditMode={isEditMode}
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
