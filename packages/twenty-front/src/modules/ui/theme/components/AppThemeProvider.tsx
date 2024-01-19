import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';

import { darkTheme, lightTheme } from '@/ui/theme/constants/theme';

import { useColorScheme } from '../hooks/useColorScheme';
import { useSystemColorScheme } from '../hooks/useSystemColorScheme';

type AppThemeProviderProps = {
  children: JSX.Element;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const systemColorScheme = useSystemColorScheme();

  const { colorScheme } = useColorScheme();

  const cache = createCache({
    stylisPlugins: [rtlPlugin],
    key: 'rtl',
  });

  const computedColorScheme =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

  const theme = computedColorScheme === 'Dark' ? darkTheme : lightTheme;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
};
