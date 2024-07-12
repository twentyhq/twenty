import { css, Global, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Outlet } from 'react-router-dom';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  scrollbar-width: 4px;
  width: 100%;
`;

export const BlankLayout = () => {
  const theme = useTheme();
  return (
    <>
      <Global
        styles={css`
          body {
            background: ${theme.background.tertiary};
          }
        `}
      />
      <StyledLayout>
        <Outlet />
      </StyledLayout>
    </>
  );
};
