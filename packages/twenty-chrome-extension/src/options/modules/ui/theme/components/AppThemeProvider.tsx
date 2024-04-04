import { ThemeProvider } from '@emotion/react';

import { THEME_LIGHT } from '@/ui/theme/constants/ThemeLight';

type AppThemeProviderProps = {
  children: JSX.Element;
};

const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const theme = THEME_LIGHT;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export { AppThemeProvider };
