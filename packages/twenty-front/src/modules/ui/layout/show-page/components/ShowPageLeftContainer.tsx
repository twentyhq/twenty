import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledOuterContainer = styled.div<{ isInRightDrawer: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-left-radius: 8px;
  border-right: ${({ theme }) =>
    useIsMobile() ? 'none' : `1px solid ${theme.border.color.medium}`};
  border-top-left-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 10;
  width: ${({ isInRightDrawer }) => (isInRightDrawer ? `100%` : 'auto')};
`;

const StyledInnerContainer = styled.div<{ isInRightDrawer: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ isInRightDrawer }) =>
    useIsMobile() || isInRightDrawer ? `100%` : '348px'};
`;

const StyledIntermediateContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

export type ShowPageLeftContainerProps = {
  isInRightDrawer: boolean;
  children: ReactNode;
};

export const ShowPageLeftContainer = ({
  isInRightDrawer = false,
  children,
}: ShowPageLeftContainerProps) => {
  const isMobile = useIsMobile();
  return isMobile || isInRightDrawer ? (
    <StyledOuterContainer isInRightDrawer={isInRightDrawer}>
      <StyledInnerContainer isInRightDrawer={isInRightDrawer}>
        {children}
      </StyledInnerContainer>
    </StyledOuterContainer>
  ) : (
    <StyledOuterContainer isInRightDrawer={isInRightDrawer}>
      <ScrollWrapper>
        <StyledIntermediateContainer>
          <StyledInnerContainer isInRightDrawer={isInRightDrawer}>
            {children}
          </StyledInnerContainer>
        </StyledIntermediateContainer>
      </ScrollWrapper>
    </StyledOuterContainer>
  );
};
