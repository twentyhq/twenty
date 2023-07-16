import styled from '@emotion/styled';

import { overlayBackground } from '@/ui/themes/effects';

export const InplaceInputContainer = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  margin-left: -1px;
  min-height: 32px;
  width: inherit;

  ${overlayBackground}

  z-index: 10;
`;
