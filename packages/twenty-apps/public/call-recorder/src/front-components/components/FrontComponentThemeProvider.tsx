import { type ReactNode } from 'react';
import { useColorScheme } from 'twenty-sdk/front-component';
import { THEME_DARK, THEME_LIGHT, ThemeProvider } from 'twenty-ui/theme';

type FrontComponentThemeProviderProps = {
  children: ReactNode;
};

export const FrontComponentThemeProvider = ({
  children,
}: FrontComponentThemeProviderProps) => {
  const colorScheme = useColorScheme();

  // Without an explicit theme, icon sizes resolve to var() strings SVG attributes cannot use.
  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      {children}
    </ThemeProvider>
  );
};
