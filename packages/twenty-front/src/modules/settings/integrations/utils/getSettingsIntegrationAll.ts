import { type SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

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
      link: getSettingsPath(SettingsPath.IntegrationDatabase, {
        databaseKey: 'airtable',
      }),
    },
    isPostgresqlIntegrationEnabled && {
      from: {
        key: 'postgresql',
        image: '/images/integrations/postgresql-logo.png',
      },
      type: isPostgresqlIntegrationActive ? 'Active' : 'Add',
      text: 'PostgreSQL',
      link: getSettingsPath(SettingsPath.IntegrationDatabase, {
        databaseKey: 'postgresql',
      }),
    },
    isStripeIntegrationEnabled && {
      from: {
        key: 'stripe',
        image: '/images/integrations/stripe-logo.png',
      },
      type: isStripeIntegrationActive ? 'Active' : 'Add',
      text: 'Stripe',
      link: getSettingsPath(SettingsPath.IntegrationDatabase, {
        databaseKey: 'stripe',
      }),
    },
  ].filter(Boolean) as SettingsIntegration[],
});
