import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_WINDMILL_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'windmill',
    title: 'With Windmill',
    hyperlink: null,
    integrations: [
      {
        from: {
          key: 'windmill',
          image: '/images/integrations/windmill-logo.png',
        },
        to: null,
        type: 'Goto',
        text: 'Create a workflow with Windmill',
        link: 'https://www.windmill.dev',
        linkText: 'Go to Windmill',
      },
    ],
  };
