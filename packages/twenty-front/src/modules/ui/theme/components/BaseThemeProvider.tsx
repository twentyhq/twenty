import { ThemeProvider } from 'twenty-ui/theme-constants';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

type BaseThemeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const BaseThemeProvider = ({ children }: BaseThemeProviderProps) => {
  const { effectiveColorScheme } = useColorScheme();

  return (
    <ThemeProvider
      colorScheme={effectiveColorScheme === 'Dark' ? 'dark' : 'light'}
    >
      {children}
    </ThemeProvider>
  );
};
