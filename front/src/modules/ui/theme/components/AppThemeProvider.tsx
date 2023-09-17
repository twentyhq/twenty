import { ThemeProvider } from '@emotion/react';

import { darkTheme, lightTheme } from '@/ui/theme/constants/theme';
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

export const AppThemeProvider = ({ children }: OwnProps) => {
  const systemColorScheme = useSystemColorScheme();

  const { colorScheme } = useColorScheme();

  const theme =
    themes[
      colorScheme === ColorScheme.System ? systemColorScheme : colorScheme
    ];

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
