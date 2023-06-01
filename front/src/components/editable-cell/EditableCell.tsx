import { ReactElement } from 'react';
import { CellBaseContainer } from './CellBaseContainer';
import { CellNormalModeContainer } from './CellNormalModeContainer';
import { useRecoilState } from 'recoil';
import { isSomeInputInEditModeState } from '../../modules/ui/tables/states/isSomeInputInEditModeState';
import { EditableCellEditMode } from './EditableCellEditMode';

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

export function EditableCell({
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
      {isEditMode ? (
        <EditableCellEditMode
          editModeContent={editModeContent}
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
          isEditMode={isEditMode}
          onOutsideClick={onOutsideClick}
        />
      ) : (
        <CellNormalModeContainer>{nonEditModeContent}</CellNormalModeContainer>
      )}
    </CellBaseContainer>
  );
}
