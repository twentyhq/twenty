import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  flex-shrink: 0;
  height: ${APP_HEADER_HEIGHT}px;
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledToolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  overflow: hidden;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: auto;
`;

type LogConsoleToolbarLayoutProps = {
  children: ReactNode;
  actions?: ReactNode;
};

export const LogConsoleToolbarLayout = ({
  children,
  actions,
}: LogConsoleToolbarLayoutProps) => (
  <StyledContainer>
    <StyledToolbar>
      {children}
      <StyledActions>{actions}</StyledActions>
    </StyledToolbar>
  </StyledContainer>
);
