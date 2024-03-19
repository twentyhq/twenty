import { SettingsIntegrationCategory } from '~/pages/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_ALL_CATEGORY: SettingsIntegrationCategory = {
  key: 'all',
  title: 'All',
  integrations: [
    {
      from: {
        key: 'airtable',
        image: '/images/integrations/airtable-logo.png',
      },
      type: 'Soon',
      text: 'Airtable',
      link: '/settings/integrations/airtable',
    },
    {
      from: {
        key: 'postgresql',
        image: '/images/integrations/postgresql-logo.png',
      },
      type: 'Soon',
      text: 'PostgreSQL',
      link: '/settings/integrations/postgresql',
    },
  ],
};
