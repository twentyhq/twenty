import styled from '@emotion/styled';

import { useIsMobile } from '../../../../hooks/useIsMobile';

export const ShowPageContainer = styled.div`
  display: flex;
  flex-direction: ${() => {
    const isMobile = useIsMobile();

    return isMobile ? 'column' : 'row';
  }};
  gap: ${({ theme }) => (useIsMobile() ? theme.spacing(3) : '0')};
  height: 100%;
  width: ${() => (useIsMobile() ? `calc(100% - 2px);` : '100%')};
`;
