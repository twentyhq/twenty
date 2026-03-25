import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLayout = styled.div`
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  scrollbar-width: 4px;
  width: 100%;
`;

export const BlankLayout = () => {
  return (
    <StyledLayout>
      <Outlet />
    </StyledLayout>
  );
};
