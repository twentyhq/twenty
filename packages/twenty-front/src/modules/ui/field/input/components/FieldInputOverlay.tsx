import styled from '@emotion/styled';

import { OVERLAY_BACKGROUND } from '@/ui/theme/constants/OverlayBackground';

const StyledFieldInputOverlay = styled.div`
  align-items: center;
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  ${OVERLAY_BACKGROUND}
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: 32px;
  justify-content: space-between;
  margin: -1px;
  width: 100%;
`;

export const FieldInputOverlay = StyledFieldInputOverlay;
