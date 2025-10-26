import { ThemeProvider } from '@emotion/react';
import type React from 'react';
import { THEME_LIGHT, ThemeContextProvider } from 'twenty-ui/theme';

type ThemeProps = {
  children: React.ReactNode;
};

export const Theme = ({ children }: ThemeProps) => {
  return (
    <ThemeProvider theme={THEME_LIGHT}>
      <ThemeContextProvider theme={THEME_LIGHT}>
        {children}
      </ThemeContextProvider>
    </ThemeProvider>
  );
};
