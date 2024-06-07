import styled from '@emotion/styled';
import { OVERLAY_BACKGROUND } from 'twenty-ui';

const StyledFieldInputOverlay = styled.div`
  align-items: center;
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: 32px;
  justify-content: space-between;
  margin: -1px;
  width: 100%;
  ${OVERLAY_BACKGROUND}
`;

export const FieldInputOverlay = StyledFieldInputOverlay;
