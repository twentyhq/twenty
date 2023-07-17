import { ThemeProvider } from '@emotion/react';

import { darkTheme, lightTheme } from '@/ui/themes/themes';

import { ColorScheme, useColorScheme } from '../hooks/useColorScheme';
import { useSystemColorScheme } from '../hooks/useSystemColorScheme';

type OwnProps = {
  children: JSX.Element;
};

const themes = {
  [ColorScheme.Dark]: darkTheme,
  [ColorScheme.Light]: lightTheme,
};

export function AppThemeProvider({ children }: OwnProps) {
  const systemColorScheme = useSystemColorScheme();

  const { colorScheme } = useColorScheme();

  console.log('systemColorScheme', systemColorScheme);
  console.log('colorScheme', colorScheme);

  const theme =
    themes[
      colorScheme === ColorScheme.System ? systemColorScheme : colorScheme
    ];

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
