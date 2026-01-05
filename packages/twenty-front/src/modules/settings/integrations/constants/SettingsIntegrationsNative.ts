import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';

export const SETTINGS_INTEGRATION_NATIVE_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'native',
    title: 'Native integrations',
    hyperlink: null,
    integrations: [
      {
        from: { key: 'Twenty', image: '/images/integrations/twenty-logo.svg' },
        to: {
          key: 'WhatsApp',
          image: '/images/integrations/whatsapp-logo.png',
        },
        type: 'Active',
        text: 'Connect WhatsApp Business Account to have conversations with your customers in Twenty',
        link: getSettingsPath(SettingsPath.IntegrationsWhatsapp),
        //linkText: 'Open settings',
      },
    ],
  };
