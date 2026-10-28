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

  // twenty-ui components read icon sizes off the theme context, and without an
  // explicit theme they resolve to var() strings an SVG size attribute cannot
  // use — icons render at their intrinsic size without a real theme here.
  return (
    <ThemeProvider
      colorScheme={colorScheme}
      theme={colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT}
    >
      {children}
    </ThemeProvider>
  );
};
