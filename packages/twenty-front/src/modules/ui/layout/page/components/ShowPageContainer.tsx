import { type ReactElement } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';

const StyledOuterContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  gap: ${({ isMobile }) => (isMobile ? 'var(--spacing-3)' : '0')};
  height: 100%;
  width: 100%;
`;

const StyledInnerContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  width: 100%;
  height: 100%;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  background-color: var(--background-secondary);
  border-radius: var(--border-radius-md);
`;

export type ShowPageContainerProps = {
  children: ReactElement[] | ReactElement;
};

export const ShowPageContainer = ({ children }: ShowPageContainerProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <StyledOuterContainer isMobile={isMobile}>
      <StyledScrollWrapper
        componentInstanceId={'scroll-wrapper-show-page-container'}
      >
        <StyledInnerContainer isMobile={isMobile}>
          {children}
        </StyledInnerContainer>
      </StyledScrollWrapper>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer isMobile={isMobile}>
      <StyledInnerContainer isMobile={isMobile}>
        {children}
      </StyledInnerContainer>
    </StyledOuterContainer>
  );
};
