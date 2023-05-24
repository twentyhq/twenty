import styled from '@emotion/styled';
import { ReactElement, useRef } from 'react';
import { useOutsideAlerter } from '../../hooks/useOutsideAlerter';
import { useListenKeyboardShortcut } from '../../modules/ui/hooks/useListenKeyboardShortcut';

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  isEditMode?: boolean;
  onCancel?: () => void;
  onValidate?: () => void;
  onInsideClick?: () => void;
};

const StyledWrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  user-select: none;
`;

type StyledEditModeContainerProps = {
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
};

const StyledNonEditModeContainer = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - ${(props) => props.theme.spacing(5)});
  height: 100%;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  overflow: hidden;
`;

const StyledEditModeContainer = styled.div<StyledEditModeContainerProps>`
  display: flex;
  align-items: center;
  min-width: 100%;
  min-height: 100%;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  position: absolute;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) => (props.editModeVerticalPosition === 'over' ? '0' : '100%')};

  background: ${(props) => props.theme.primaryBackground};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
  z-index: 1;
  border-radius: 4px;
  backdrop-filter: blur(20px);
`;

export function EditableCellWrapperWithShortcut({
  editModeContent,
  nonEditModeContent,
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  isEditMode = false,
  onCancel,
  onValidate,
  onInsideClick,
}: OwnProps) {
  const wrapperRef = useRef(null);

  useOutsideAlerter(wrapperRef, () => {
    onValidate && onValidate();
  });

  useListenKeyboardShortcut(
    'Escape',
    () => {
      console.log('Escape pressed');
      onCancel && onCancel();
    },
    [],
  );

  useListenKeyboardShortcut(
    'Enter',
    () => {
      console.log('Escape pressed');
      onValidate && onValidate();
    },
    [],
  );

  return (
    <StyledWrapper
      ref={wrapperRef}
      onClick={() => {
        onInsideClick && onInsideClick();
      }}
    >
      <StyledNonEditModeContainer>
        {nonEditModeContent}
      </StyledNonEditModeContainer>
      {isEditMode && (
        <StyledEditModeContainer
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
        >
          {editModeContent}
        </StyledEditModeContainer>
      )}
    </StyledWrapper>
  );
}
