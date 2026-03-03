import { styled } from '@linaria/react';
import { type CSSProperties, type ReactNode } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOuterContainer = styled.div`
  display: flex;
  gap: var(--show-page-gap, 0);
  height: 100%;
  width: 100%;
`;

const StyledInnerContainer = styled.div`
  display: flex;
  flex-direction: var(--show-page-direction, row);
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

  const mobileStyle = isMobile
    ? ({
        '--show-page-gap': themeCssVariables.spacing[3],
        '--show-page-direction': 'column',
      } as CSSProperties)
    : undefined;

  return isMobile ? (
    <StyledOuterContainer style={mobileStyle}>
      <StyledScrollWrapper componentInstanceId="scroll-wrapper-show-page-container">
        <StyledInnerContainer style={mobileStyle}>
          {children}
        </StyledInnerContainer>
      </StyledScrollWrapper>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer>
      <StyledInnerContainer>{children}</StyledInnerContainer>
    </StyledOuterContainer>
  );
};
