import { styled } from '@linaria/react';
import { Outlet } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useContext, useEffect } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

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
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    document.body.style.background = theme.background.tertiary;
    return () => {
      document.body.style.background = '';
    };
  }, [theme.background.tertiary]);

  return (
    <StyledLayout>
      <Outlet />
    </StyledLayout>
  );
};
