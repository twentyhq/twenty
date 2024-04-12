import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_EXTENSION_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'extension',
    title: 'With Chrome',
    hyperlink: null,
    integrations: [
      {
        from: {
          key: 'chrome',
          image: '/images/integrations/chrome-icon.svg',
        },
        to: null,
        type: 'Goto',
        text: 'LinkedIn extension for Chrome',
        link: 'https://chromewebstore.google.com/detail/twenty/lanlmmgcjjmlbfbooodedgblillmnafb',
        linkText: 'Go to extension',
      },
    ],
  };
