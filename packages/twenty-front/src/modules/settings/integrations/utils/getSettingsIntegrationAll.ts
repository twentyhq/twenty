import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
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
    isAirtableIntegrationEnabled && {
      from: {
        key: 'airtable',
        image: '/images/integrations/airtable-logo.png',
      },
      type: isAirtableIntegrationActive ? 'Active' : 'Add',
      text: 'Airtable',
      link: '/settings/integrations/airtable',
    },
    isPostgresqlIntegrationEnabled && {
      from: {
        key: 'postgresql',
        image: '/images/integrations/postgresql-logo.png',
      },
      type: isPostgresqlIntegrationActive ? 'Active' : 'Add',
      text: 'PostgreSQL',
      link: '/settings/integrations/postgresql',
    },
    isStripeIntegrationEnabled && {
      from: {
        key: 'stripe',
        image: '/images/integrations/stripe-logo.png',
      },
      type: isStripeIntegrationActive ? 'Active' : 'Add',
      text: 'Stripe',
      link: '/settings/integrations/stripe',
    },
  ].filter(Boolean) as SettingsIntegration[],
});
