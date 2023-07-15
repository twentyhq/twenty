import { ThemeProvider } from '@emotion/react';

import { darkTheme, lightTheme } from '@/ui/themes/themes';
import { browserPrefersDarkMode } from '@/utils/utils';

type OwnProps = {
  children: JSX.Element;
};

export function AppThemeProvider({ children }: OwnProps) {
  const selectedTheme = browserPrefersDarkMode() ? darkTheme : darkTheme;

  return <ThemeProvider theme={selectedTheme}>{children}</ThemeProvider>;
}
