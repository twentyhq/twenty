import { ThemeProvider } from '@emotion/react';
import type React from 'react';
import { THEME_DARK, ThemeContextProvider } from 'twenty-ui/theme';

type ThemeContextProps = {
  children: React.ReactNode;
};

export const ThemeContext = ({ children }: ThemeContextProps) => {
  return (
      <ThemeProvider theme={THEME_DARK}>
        <ThemeContextProvider theme={THEME_DARK}>
          {children}
        </ThemeContextProvider>
      </ThemeProvider>
  );
};
