import { ThemeProvider } from '@emotion/react';
import type React from 'react';
import { THEME_DARK, ThemeContextProvider } from 'twenty-ui/theme';

type ThemeProps = {
  children: React.ReactNode;
};

export const Theme = ({ children }: ThemeProps) => {
  return (
    <ThemeProvider theme={THEME_DARK}>
      <ThemeContextProvider theme={THEME_DARK}>{children}</ThemeContextProvider>
    </ThemeProvider>
  );
};
