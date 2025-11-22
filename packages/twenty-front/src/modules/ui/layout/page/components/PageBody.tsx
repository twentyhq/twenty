import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { PagePanel } from './PagePanel';

type PageBodyProps = {
  children: ReactNode;
  className?: string;
};

const StyledMainContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 0;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  padding-left: 0;
  width: 100%;

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

export const PageBody = ({ children, className }: PageBodyProps) => (
  <StyledMainContainer className={className}>
    <StyledLeftContainer>
      <PagePanel>{children}</PagePanel>
    </StyledLeftContainer>
  </StyledMainContainer>
);
