import styled from '@emotion/styled';

import { useIsMobile } from '../../../../../hooks/useIsMobile';

export const ShowPageLeftContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top-left-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: 0px ${({ theme }) => theme.spacing(3)};
  width: ${({ theme }) => {
    const isMobile = useIsMobile();

    return isMobile ? `calc(100% - ${theme.spacing(6)})` : '320px';
  }};
`;
