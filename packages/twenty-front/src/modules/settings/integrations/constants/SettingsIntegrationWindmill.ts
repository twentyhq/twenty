import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import i18n from '~/utils/i18n/index';

export const SETTINGS_INTEGRATION_WINDMILL_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'windmill',
    title: i18n.t('withWindmill'),
    hyperlink: null,
    integrations: [
      {
        from: {
          key: 'windmill',
          image: '/images/integrations/windmill-logo.png',
        },
        to: null,
        type: 'Goto',
        text: i18n.t('windmillText'),
        link: 'https://www.windmill.dev',
        linkText: i18n.t('goToWindmill'),
      },
    ],
  };
