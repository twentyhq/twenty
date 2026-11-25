import 'twenty-ui/style.css';
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

import { useColorScheme } from 'twenty-sdk/front-component';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme';

import { AccountHealthSettings } from 'src/front-components/components/AccountHealthSettings';
import { AdReferralSettings } from 'src/front-components/components/AdReferralSettings';
import { NotificationRecipientsSettings } from 'src/front-components/components/NotificationRecipientsSettings';

const columnStyle = { display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[8] } as const;

export const WhatsAppSettings = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <div style={columnStyle}>
        <AccountHealthSettings />
        <NotificationRecipientsSettings />
        <AdReferralSettings />
      </div>
    </ThemeProvider>
  );
};
