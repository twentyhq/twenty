import styled from '@emotion/styled';

import { RightDrawer } from '@/ui/layout/right-drawer/components/RightDrawer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PagePanel } from './PagePanel';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { ReactNode } from 'react';

type RightDrawerContainerProps = {
  children: ReactNode;
};

const StyledMainContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 100%;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  box-sizing: border-box;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(3)};
    padding-bottom: 0;
  }
`;

type LeftContainerProps = {
  isRightDrawerOpen?: boolean;
};

const StyledLeftContainer = styled.div<LeftContainerProps>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
`;

export const RightDrawerContainer = ({
  children,
}: RightDrawerContainerProps) => (
  <StyledMainContainer>
    <StyledLeftContainer>
      <PagePanel>{children}</PagePanel>
    </StyledLeftContainer>
    <RightDrawer />
  </StyledMainContainer>
);
