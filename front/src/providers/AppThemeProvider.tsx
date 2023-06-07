import { ThemeProvider } from '@emotion/react';
import { useRecoilValue } from 'recoil';

import { themeEnabledState } from '@/ui/layout/states/themeEnabledState';
import { darkTheme, lightTheme } from '@/ui/layout/styles/themes';
import { browserPrefersDarkMode } from '@/utils/utils';

type OwnProps = {
  children: JSX.Element;
};

export function AppThemeProvider({ children }: OwnProps) {
  const selectedTheme = browserPrefersDarkMode() ? darkTheme : lightTheme;
  const themeEnabled = useRecoilValue(themeEnabledState);

  return themeEnabled ? (
    <ThemeProvider theme={selectedTheme}>{children}</ThemeProvider>
  ) : (
    <>{children}</>
  );
}
