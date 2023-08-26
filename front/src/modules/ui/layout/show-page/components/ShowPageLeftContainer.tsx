import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledOuterContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: ${({ theme }) => {
    const isMobile = useIsMobile();
    return !isMobile ? `1px solid ${theme.border.color.medium}` : 'none';
  }};
  border-top-left-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};

  z-index: 10;
`;

const StyledInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px ${({ theme }) => theme.spacing(2)} 0px
    ${({ theme }) => theme.spacing(3)};
  width: ${({ theme }) => {
    const isMobile = useIsMobile();

    return isMobile ? `calc(100% - ${theme.spacing(5)})` : '320px';
  }};
`;

export type ShowPageLeftContainerProps = {
  children: ReactElement[];
};

export function ShowPageLeftContainer({
  children,
}: ShowPageLeftContainerProps) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <StyledOuterContainer>
      <StyledInnerContainer>{children}</StyledInnerContainer>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer>
      <ScrollWrapper>
        <StyledInnerContainer>{children}</StyledInnerContainer>
      </ScrollWrapper>
    </StyledOuterContainer>
  );
}
