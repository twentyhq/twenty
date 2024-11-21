import { useContext, useEffect } from 'react';

import { ThemeSchemeContext } from '@/ui/theme/components/BaseThemeProvider';
import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { useColorScheme } from '../hooks/useColorScheme';

export const UserThemeProviderEffect = () => {
  const { colorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const setThemeScheme = useContext(ThemeSchemeContext);

  useEffect(() => {
    setThemeScheme(colorScheme === 'System' ? systemColorScheme : colorScheme);
  }, [colorScheme, setThemeScheme, systemColorScheme]);

  return <></>;
};
