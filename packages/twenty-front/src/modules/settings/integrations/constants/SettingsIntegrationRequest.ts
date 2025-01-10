import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import i18n from '~/utils/i18n/index';

export const SETTINGS_INTEGRATION_REQUEST_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'request',
    title: i18n.t('requestIntegration'),
    hyperlink: null,
    integrations: [
      {
        from: { key: 'github', image: '/images/integrations/github-logo.png' },
        to: null,
        type: 'Goto',
        text: i18n.t('requestIntegrationDescription'),
        link: 'https://github.com/twentyhq/twenty/discussions/categories/ideas',
        linkText: i18n.t('goToGithub'),
      },
    ],
  };
