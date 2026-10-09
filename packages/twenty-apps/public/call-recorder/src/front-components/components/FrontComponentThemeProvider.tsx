import { type ReactNode } from 'react';
import { useColorScheme } from 'twenty-sdk/front-component';
import { THEME_DARK, THEME_LIGHT } from 'twenty-ui/theme';
import { ThemeContext, type ThemeType } from 'twenty-ui/theme-constants';

type FrontComponentThemeProviderProps = {
  children: ReactNode;
};

export const FrontComponentThemeProvider = ({
  children,
}: FrontComponentThemeProviderProps) => {
  const colorScheme = useColorScheme();

  // twenty-ui components read icon sizes off ThemeContext, and the context
  // default resolves them to var() strings an SVG size attribute cannot use —
  // icons render at their intrinsic size without a real theme here.
  return (
    <ThemeContext.Provider
      value={{
        theme: (colorScheme === 'dark'
          ? THEME_DARK
          : THEME_LIGHT) as unknown as ThemeType,
        colorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
