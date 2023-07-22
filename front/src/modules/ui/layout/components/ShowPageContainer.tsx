import styled from '@emotion/styled';

import { useIsMobile } from '../../../../hooks/useIsMobile';

export const ShowPageContainer = styled.div`
  display: flex;
  flex-direction: ${() => {
    const isMobile = useIsMobile();

    return isMobile ? 'column' : 'row';
  }};
  height: 100%;
  width: 100%;
`;
