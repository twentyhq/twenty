import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOuterContainer = styled.div`
  display: flex;
  gap: ${() => (useIsMobile() ? themeCssVariables.spacing[3] : '0')};
  height: 100%;
  width: 100%;
`;

const StyledInnerContainer = styled.div`
  display: flex;
  flex-direction: ${() => (useIsMobile() ? 'column' : 'row')};
  width: 100%;
  height: 100%;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  background-color: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
`;

export type ShowPageContainerProps = {
  children: ReactNode;
};

export const ShowPageContainer = ({ children }: ShowPageContainerProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <StyledOuterContainer>
      <StyledScrollWrapper componentInstanceId="scroll-wrapper-show-page-container">
        <StyledInnerContainer>{children}</StyledInnerContainer>
      </StyledScrollWrapper>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer>
      <StyledInnerContainer>{children}</StyledInnerContainer>
    </StyledOuterContainer>
  );
};
