import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { PagePanel } from './PagePanel';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PageBodyProps = {
  children: ReactNode;
  className?: string;
};

const StyledMainContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  padding-bottom: ${themeCssVariables.spacing[3]};
  padding-left: 0;
  padding-right: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

type LeftContainerProps = {
  isSidePanelOpen?: boolean;
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
