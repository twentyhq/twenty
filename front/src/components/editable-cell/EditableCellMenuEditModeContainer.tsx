import styled from '@emotion/styled';
import { overlayBackground } from '../../layout/styles/themes';

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
    props.editModeHorizontalAlign === 'right' ? 'auto' : '-1px'};
  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) => (props.editModeVerticalPosition === 'over' ? '0' : '100%')};

  border: 1px solid ${(props) => props.theme.primaryBorder};
  z-index: 1;
  border-radius: 4px;
  ${overlayBackground}
`;
