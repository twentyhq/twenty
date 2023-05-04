import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactElement, useRef, useState } from 'react';
import { useOutsideAlerter } from '../../../hooks/useOutsideAlerter';
import { ThemeType } from '../../../layout/styles/themes';

type OwnProps = {
  children: ReactElement;
  onEditModeChange: (isEditMode: boolean) => void;
};

const StyledWrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;
  width: 100%;
`;

type styledEditModeWrapperProps = {
  isEditMode: boolean;
};

const styledEditModeWrapper = (theme: ThemeType) =>
  css`
    position: absolute;
    width: 260px;
    height: 100%;

    display: flex;
    padding-left: ${theme.spacing(2)};
    padding-right: ${theme.spacing(2)};
    background: ${theme.primaryBackground};
    border: 1px solid ${theme.primaryBorder};
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
    z-index: 1;
    border-radius: 4px;
    backdrop-filter: blur(20px);
  `;

const Container = styled.div<styledEditModeWrapperProps>`
  width: 100%;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
  ${(props) => props.isEditMode && styledEditModeWrapper(props.theme)}
`;

function EditableCellWrapper({ children, onEditModeChange }: OwnProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setIsEditMode(false);
    onEditModeChange(false);
  });

  return (
    <StyledWrapper
      ref={wrapperRef}
      onClick={() => {
        setIsEditMode(true);
        onEditModeChange(true);
      }}
    >
      <Container isEditMode={isEditMode}>{children}</Container>
    </StyledWrapper>
  );
}

export default EditableCellWrapper;
