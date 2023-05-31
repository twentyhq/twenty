import { ReactElement } from 'react';
import { CellBaseContainer } from './CellBaseContainer';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { isSomeInputInEditModeState } from '../../modules/ui/tables/states/isSomeInputInEditModeState';
import { EditableCellMenuEditMode } from './EditableCellMenuEditMode';

const EditableCellMenuNormalModeContainer = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - ${(props) => props.theme.spacing(5)});
  height: 100%;
  overflow: hidden;
`;

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  isEditMode?: boolean;
  isCreateMode?: boolean;
  onOutsideClick?: () => void;
  onInsideClick?: () => void;
};

// TODO: refactor
export function EditableCellMenu({
  editModeContent,
  nonEditModeContent,
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  isEditMode = false,
  onOutsideClick,
  onInsideClick,
}: OwnProps) {
  const [isSomeInputInEditMode, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );

  function handleOnClick() {
    if (!isSomeInputInEditMode) {
      onInsideClick?.();
      setIsSomeInputInEditMode(true);
    }
  }

  return (
    <CellBaseContainer onClick={handleOnClick}>
      <EditableCellMenuNormalModeContainer>
        {nonEditModeContent}
      </EditableCellMenuNormalModeContainer>
      {isEditMode && (
        <EditableCellMenuEditMode
          editModeContent={editModeContent}
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
          isEditMode={isEditMode}
          onOutsideClick={onOutsideClick}
          onInsideClick={onInsideClick}
        />
      )}
    </CellBaseContainer>
  );
}
