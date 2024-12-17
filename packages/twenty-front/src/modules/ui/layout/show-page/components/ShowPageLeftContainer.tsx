import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledOuterContainer = styled.div<{ isMobile: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: ${({ theme, isMobile }) =>
    isMobile ? 'none' : `1px solid ${theme.border.color.medium}`};
  border-top-left-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 10;
  width: 'auto';
`;

const StyledInnerContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ isMobile }) => (isMobile ? `100%` : '348px')};
`;

const StyledIntermediateContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

export type ShowPageLeftContainerProps = {
  forceMobile: boolean;
  children: ReactNode;
};

export const ShowPageLeftContainer = ({
  forceMobile = false,
  children,
}: ShowPageLeftContainerProps) => {
  const isMobile = useIsMobile() || forceMobile;
  return (
    <StyledOuterContainer isMobile={isMobile}>
      {isMobile ? (
        <StyledInnerContainer isMobile={isMobile}>
          {children}
        </StyledInnerContainer>
      ) : (
        <ScrollWrapper
          contextProviderName="showPageLeftContainer"
          componentInstanceId={`scroll-wrapper-show-page-left-container`}
        >
          <StyledIntermediateContainer>
            <StyledInnerContainer isMobile={isMobile}>
              {children}
            </StyledInnerContainer>
          </StyledIntermediateContainer>
        </ScrollWrapper>
      )}
    </StyledOuterContainer>
  );
};
