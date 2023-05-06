import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactElement, useRef, useState } from 'react';
import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import { ThemeType } from '../../../layout/styles/themes';

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  onEditModeChange?: (isEditMode: boolean) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
};

const StyledWrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;
  width: 100%;
`;

type StyledEditModeContainerProps = {
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
};

const StyledNonEditModeContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
`;

const StyledEditModeContainer = styled.div<StyledEditModeContainerProps>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  position: absolute;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) =>
    props.editModeVerticalPosition === 'over' ? 'auto' : '100%'};

  background: ${(props) => props.theme.primaryBackground};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
  z-index: 1;
  border-radius: 4px;
  backdrop-filter: blur(20px);
`;

function EditableCellWrapper({
  editModeContent,
  nonEditModeContent,
  onEditModeChange,
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
}: OwnProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setIsEditMode(false);
    onEditModeChange && onEditModeChange(false);
  });

  return (
    <StyledWrapper
      ref={wrapperRef}
      onClick={() => {
        setIsEditMode(true);
        onEditModeChange && onEditModeChange(true);
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

export default EditableCellWrapper;
