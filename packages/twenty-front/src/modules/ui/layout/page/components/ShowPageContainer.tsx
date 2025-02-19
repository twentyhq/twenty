import styled from '@emotion/styled';
import { ReactElement } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledOuterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => (useIsMobile() ? theme.spacing(3) : '0')};
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
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export type ShowPageContainerProps = {
  children: ReactElement[] | ReactElement;
};

export const ShowPageContainer = ({ children }: ShowPageContainerProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <StyledOuterContainer>
      <StyledScrollWrapper
        contextProviderName="showPageContainer"
        componentInstanceId={'scroll-wrapper-show-page-container'}
      >
        <StyledInnerContainer>{children}</StyledInnerContainer>
      </StyledScrollWrapper>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer>
      <StyledInnerContainer>{children}</StyledInnerContainer>
    </StyledOuterContainer>
  );
};
