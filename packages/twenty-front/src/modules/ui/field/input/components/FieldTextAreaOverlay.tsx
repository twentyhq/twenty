import styled from '@emotion/styled';
import { OVERLAY_BACKGROUND } from 'twenty-ui';

const StyledFieldTextAreaOverlay = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  margin: -1px;
  max-height: 420px;
  position: absolute;
  top: 0;
  width: 100%;
  ${OVERLAY_BACKGROUND}
`;

export const FieldTextAreaOverlay = StyledFieldTextAreaOverlay;
