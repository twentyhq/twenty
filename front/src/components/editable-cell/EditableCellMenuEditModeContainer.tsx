import styled from '@emotion/styled';

type OwnProps = {
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
};

// TODO: refactor
export const EditableCellMenuEditModeContainer = styled.div<OwnProps>`
  display: flex;
  align-items: center;
  min-width: 100%;
  min-height: 100%;
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
