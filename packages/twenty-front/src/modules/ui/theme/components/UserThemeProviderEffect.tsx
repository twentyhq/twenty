import { useContext, useEffect } from 'react';

import { ThemeSchemeContext } from '@/ui/theme/components/BaseThemeProvider';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';

export const UserThemeProviderEffect = () => {
  const { colorScheme } = useColorScheme();
  const setThemeScheme = useContext(ThemeSchemeContext);

  useEffect(() => {
    setThemeScheme(colorScheme);
  }, [colorScheme, setThemeScheme]);

  return <></>;
};
