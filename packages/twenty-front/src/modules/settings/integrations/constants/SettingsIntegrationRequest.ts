import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_REQUEST_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'request',
    title: 'Request an integration',
    hyperlink: null,
    integrations: [
      {
        from: { key: 'github', image: '/images/integrations/github-logo.png' },
        to: null,
        type: 'Goto',
        text: 'Request an integration on Github conversations',
        link: 'https://github.com/twentyhq/twenty/discussions/categories/ideas',
        linkText: 'Go to GitHub',
      },
    ],
  };
