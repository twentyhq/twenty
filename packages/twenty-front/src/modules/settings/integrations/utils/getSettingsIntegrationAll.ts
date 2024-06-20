import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const getSettingsIntegrationAll = ({
  isAirtableIntegrationEnabled,
  isAirtableIntegrationActive,
  isPostgresqlIntegrationEnabled,
  isPostgresqlIntegrationActive,
  isStripeIntegrationEnabled,
  isStripeIntegrationActive,
}: {
  isAirtableIntegrationEnabled: boolean;
  isAirtableIntegrationActive: boolean;
  isPostgresqlIntegrationEnabled: boolean;
  isPostgresqlIntegrationActive: boolean;
  isStripeIntegrationEnabled: boolean;
  isStripeIntegrationActive: boolean;
}): SettingsIntegrationCategory => ({
  key: 'all',
  title: 'All',
  integrations: [
    {
      from: {
        key: 'airtable',
        image: '/images/integrations/airtable-logo.png',
      },
      type: !isAirtableIntegrationEnabled
        ? 'Soon'
        : isAirtableIntegrationActive
          ? 'Active'
          : 'Add',
      text: 'Airtable',
      link: '/settings/integrations/airtable',
    },
    {
      from: {
        key: 'postgresql',
        image: '/images/integrations/postgresql-logo.png',
      },
      type: !isPostgresqlIntegrationEnabled
        ? 'Soon'
        : isPostgresqlIntegrationActive
          ? 'Active'
          : 'Add',
      text: 'PostgreSQL',
      link: '/settings/integrations/postgresql',
    },
    {
      from: {
        key: 'stripe',
        image: '/images/integrations/stripe-logo.png',
      },
      type: !isStripeIntegrationEnabled
        ? 'Soon'
        : isStripeIntegrationActive
          ? 'Active'
          : 'Add',
      text: 'Stripe',
      link: '/settings/integrations/stripe',
    },
  ],
});
