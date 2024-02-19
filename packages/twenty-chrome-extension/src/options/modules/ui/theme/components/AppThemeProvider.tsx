import { ThemeProvider } from '@emotion/react';

import { lightTheme } from '../constants/theme';

type AppThemeProviderProps = {
  children: JSX.Element;
};

const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const theme = lightTheme;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export { AppThemeProvider };
