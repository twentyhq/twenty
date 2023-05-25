import { ReactElement, useRef } from 'react';
import { useOutsideAlerter } from '../../hooks/useOutsideAlerter';
import { useHotkeys } from 'react-hotkeys-hook';
import { CellBaseContainer } from './CellBaseContainer';
import { CellEditModeContainer } from './CellEditModeContainer';
import { CellNormalModeContainer } from './CellNormalModeContainer';

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
      <CellNormalModeContainer>{nonEditModeContent}</CellNormalModeContainer>
      {isEditMode && (
        <CellEditModeContainer
          ref={editableContainerRef}
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
        >
          {editModeContent}
        </CellEditModeContainer>
      )}
    </CellBaseContainer>
  );
}
