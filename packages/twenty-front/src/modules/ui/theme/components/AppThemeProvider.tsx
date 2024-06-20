import { useEffect } from 'react';
import { ThemeProvider } from '@emotion/react';
import { THEME_DARK, THEME_LIGHT, ThemeContextProvider } from 'twenty-ui';

import { useColorScheme } from '../hooks/useColorScheme';
import { useSystemColorScheme } from '../hooks/useSystemColorScheme';

type AppThemeProviderProps = {
  children: JSX.Element;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const systemColorScheme = useSystemColorScheme();

  const { colorScheme } = useColorScheme();

  const computedColorScheme =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

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
