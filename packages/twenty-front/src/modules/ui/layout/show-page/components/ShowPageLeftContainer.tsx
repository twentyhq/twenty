import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
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
  width: ${({ isMobile }) =>
    isMobile ? `100%` : `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px`};
`;

const StyledIntermediateContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

export type ShowPageLeftContainerProps = {
  children: ReactNode;
};

export const ShowPageLeftContainer = ({
  children,
}: ShowPageLeftContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledOuterContainer isMobile={isMobile}>
      {isMobile ? (
        <StyledInnerContainer isMobile={isMobile}>
          {children}
        </StyledInnerContainer>
      ) : (
        <ScrollWrapper
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
