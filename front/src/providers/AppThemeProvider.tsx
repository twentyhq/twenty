import { ThemeProvider } from '@emotion/react';

import { darkTheme, lightTheme } from '@/ui/layout/styles/themes';
import { browserPrefersDarkMode } from '@/utils/utils';

type OwnProps = {
  children: JSX.Element;
};

export function AppThemeProvider({ children }: OwnProps) {
  const selectedTheme = browserPrefersDarkMode() ? darkTheme : lightTheme;

  return <ThemeProvider theme={selectedTheme}>{children}</ThemeProvider>;
}
