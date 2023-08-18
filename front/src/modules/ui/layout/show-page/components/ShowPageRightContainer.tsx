import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const ShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  overflow: ${() => (useIsMobile() ? 'none' : 'hidden')};
  width: ${({ theme }) => {
    const isMobile = useIsMobile();

    return isMobile ? `calc(100% - ${theme.spacing(6)})` : 'auto';
  }};
`;
