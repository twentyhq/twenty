import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledOuterContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: ${({ theme }) =>
    useIsMobile() ? 'none' : `1px solid ${theme.border.color.medium}`};
  border-top-left-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 10;
`;

const StyledInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => (useIsMobile() ? '12px 0' : theme.spacing(3))};
  padding-right: ${({ theme }) => (useIsMobile() ? 0 : theme.spacing(2))};
  width: ${() => (useIsMobile() ? `100%` : '348px')};
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
  return isMobile ? (
    <StyledOuterContainer>
      <StyledInnerContainer>{children}</StyledInnerContainer>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer>
      <ScrollWrapper>
        <StyledIntermediateContainer>
          <StyledInnerContainer>{children}</StyledInnerContainer>
        </StyledIntermediateContainer>
      </ScrollWrapper>
    </StyledOuterContainer>
  );
};
