import { ThemeProvider } from '@emotion/react';

import { THEME_DARK } from '@/ui/theme/constants/ThemeDark';
import { THEME_LIGHT } from '@/ui/theme/constants/ThemeLight';

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

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
