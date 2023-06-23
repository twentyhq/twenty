import { ReactElement } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useRecoilScopedState } from '@/ui/hooks/useRecoilScopedState';

import { isSomeInputInEditModeState } from '../../tables/states/isSomeInputInEditModeState';

import { useCloseEditableCell } from './hooks/useCloseEditableCell';
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

export function EditableCellV2({
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

  const closeEditableCell = useCloseEditableCell();

  function handleOnClick() {
    if (!isSomeInputInEditMode) {
      setIsSomeInputInEditMode(true);
      setIsEditMode(true);
    }
  }

  function handleOnOutsideClick() {
    closeEditableCell();
  }

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
