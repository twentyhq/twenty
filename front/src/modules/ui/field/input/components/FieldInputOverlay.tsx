import styled from '@emotion/styled';

import { overlayBackground } from '@/ui/theme/constants/effects';

const StyledFieldInputOverlay = styled.div`
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  ${overlayBackground}
  display: flex;
  height: 32px;
  margin: -1px;
  width: 100%;
`;

export const FieldInputOverlay = StyledFieldInputOverlay;
