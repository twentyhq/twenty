import { ThemeProvider } from '@emotion/react';
import { createContext, useState } from 'react';
import {
  ColorScheme,
  THEME_DARK,
  THEME_LIGHT,
  ThemeContextProvider,
} from 'twenty-ui';

import { useSystemColorScheme } from '../hooks/useSystemColorScheme';

type BaseThemeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const ThemeSchemeContext = createContext<(theme: ColorScheme) => void>(
  () => {},
);

export const BaseThemeProvider = ({ children }: BaseThemeProviderProps) => {
  const systemColorScheme = useSystemColorScheme();
  const [themeScheme, setThemeScheme] = useState(systemColorScheme);

  document.documentElement.className =
    themeScheme === 'Dark' ? 'dark' : 'light';

  const theme = themeScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;

  return (
    <ThemeSchemeContext.Provider value={setThemeScheme}>
      <ThemeProvider theme={theme}>
        <ThemeContextProvider theme={theme}>{children}</ThemeContextProvider>
      </ThemeProvider>
    </ThemeSchemeContext.Provider>
  );
};
