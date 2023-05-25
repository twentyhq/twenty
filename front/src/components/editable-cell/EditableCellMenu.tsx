import { ReactElement, useRef } from 'react';
import { useOutsideAlerter } from '../../hooks/useOutsideAlerter';
import { useHotkeys } from 'react-hotkeys-hook';
import { CellBaseContainer } from './CellBaseContainer';
import styled from '@emotion/styled';
import { EditableCellMenuEditModeContainer } from './EditableCellMenuEditModeContainer';

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
  const wrapperRef = useRef(null);
  const editableContainerRef = useRef(null);

  useOutsideAlerter(wrapperRef, () => {
    onOutsideClick?.();
  });

  useHotkeys(
    'esc',
    () => {
      if (isEditMode) {
        onOutsideClick?.();
      }
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [isEditMode, onOutsideClick],
  );

  useHotkeys(
    'enter',
    () => {
      if (isEditMode) {
        onOutsideClick?.();
      }
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [isEditMode, onOutsideClick],
  );

  return (
    <CellBaseContainer
      ref={wrapperRef}
      onClick={() => {
        onInsideClick && onInsideClick();
      }}
    >
      <EditableCellMenuNormalModeContainer>
        {nonEditModeContent}
      </EditableCellMenuNormalModeContainer>
      {isEditMode && (
        <EditableCellMenuEditModeContainer
          ref={editableContainerRef}
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
        >
          {editModeContent}
        </EditableCellMenuEditModeContainer>
      )}
    </CellBaseContainer>
  );
}
