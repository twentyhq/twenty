import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { useColorScheme } from 'twenty-sdk/front-component';
import { ThemeProvider } from 'twenty-ui/theme';

import { QuotaSettings } from 'src/front-components/components/QuotaSettings';

export const LineSettings = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <QuotaSettings />
    </ThemeProvider>
  );
};
