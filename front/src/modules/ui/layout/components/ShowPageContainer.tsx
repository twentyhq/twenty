import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const ShowPageContainer = styled.div`
  display: flex;
  flex-direction: ${() => (useIsMobile() ? 'column' : 'row')};
  gap: ${({ theme }) => (useIsMobile() ? theme.spacing(3) : '0')};
  height: 100%;
  width: ${() => (useIsMobile() ? `calc(100% - 2px);` : '100%')};
`;
