import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { useColorScheme } from 'twenty-sdk/front-component';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme';

import { AdReferralSettings } from 'src/front-components/components/AdReferralSettings';

const getColumnStyle = () =>
  ({
    display: 'flex',
    flexDirection: 'column',
    gap: themeCssVariables.spacing[8],
  }) as const;

export const MessengerSettings = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <div style={getColumnStyle()}>
        <AdReferralSettings />
      </div>
    </ThemeProvider>
  );
};
