import styled from '@emotion/styled';
import { OVERLAY_BACKGROUND } from 'twenty-ui';

const StyledFieldTextAreaOverlay = styled.div`
  position: absolute;
  top: 0;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  align-items: center;
  display: flex;
  max-height: 420px;
  margin: -1px;
  width: 100%;
  ${OVERLAY_BACKGROUND}
`;

export const FieldTextAreaOverlay = StyledFieldTextAreaOverlay;
