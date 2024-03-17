import styled from '@emotion/styled';
import { OVERLAY_BACKGROUND } from 'twenty-ui';

const StyledFieldInputOverlay = styled.div`
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  ${OVERLAY_BACKGROUND}
  display: flex;
  height: 32px;
  margin: -1px;
  width: 100%;
`;

export const FieldInputOverlay = StyledFieldInputOverlay;
