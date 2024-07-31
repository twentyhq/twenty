import { ThemeProvider } from '@emotion/react';
import { useEffect } from 'react';
import { THEME_DARK, THEME_LIGHT, ThemeContextProvider } from 'twenty-ui';

import { useColorScheme } from '../hooks/useColorScheme';
import { useSystemColorScheme } from '../hooks/useSystemColorScheme';

type AppThemeProviderProps = {
  children: JSX.Element;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const systemColorScheme = useSystemColorScheme();
  const storedTheme = localStorage.getItem('app-theme');
  const { colorScheme } = useColorScheme();

  let computedColorScheme;
  if (storedTheme === 'Light' || storedTheme === 'Dark') {
    computedColorScheme = storedTheme;
  } else if (storedTheme === 'System' || !storedTheme) {
    computedColorScheme =
      colorScheme === 'System' ? systemColorScheme : colorScheme;
  }

  const theme = computedColorScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;

  useEffect(() => {
    document.documentElement.className =
      theme.name === 'dark' ? 'dark' : 'light';
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <ThemeContextProvider theme={theme}>{children}</ThemeContextProvider>
    </ThemeProvider>
  );
};
