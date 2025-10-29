import { css, Global, ThemeProvider } from '@emotion/react';
import type React from 'react';
import { THEME_LIGHT, ThemeContextProvider } from 'twenty-ui/theme';

type ThemeContextProps = {
  children: React.ReactNode;
};

export const ThemeContext = ({ children }: ThemeContextProps) => {
  return (
    <div>
    <Global styles={css`
       :root {
          font-family: 'Inter, sans-serif';
       }
    `}/>
      <ThemeProvider theme={THEME_LIGHT}>
        <ThemeContextProvider theme={THEME_LIGHT}>
          {children}
        </ThemeContextProvider>
      </ThemeProvider>
    </div>
  );
};
