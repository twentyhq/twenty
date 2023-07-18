import { ThemeProvider } from '@emotion/react';

import { darkTheme, lightTheme } from '@/ui/themes/themes';
import { ColorScheme } from '~/generated/graphql';

import { useColorScheme } from '../hooks/useColorScheme';
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

  const theme =
    themes[
      colorScheme === ColorScheme.System ? systemColorScheme : colorScheme
    ];

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
