import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackground = styled.div`
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: calc(100dvh / var(--t-zoom, 1));
  width: 100%;
`;

export const AuthFlowLayout = () => (
  <StyledBackground>
    <Outlet />
  </StyledBackground>
);
