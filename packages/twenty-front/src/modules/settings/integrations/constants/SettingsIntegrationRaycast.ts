import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_RAYCAST_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'raycast',
    title: 'With Raycast',
    hyperlink: null,
    integrations: [
      {
        from: {
          key: 'raycast',
          image: '/images/integrations/raycast-logo.svg',
        },
        to: null,
        type: 'Goto',
        text: 'Manage your contacts with Raycast',
        link: 'https://www.raycast.com/chrisdadev13/twenty',
        linkText: 'Go to Raycast Store',
      },
    ],
  };
