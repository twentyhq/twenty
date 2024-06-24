import { getSettingsIntegrationAll } from '../getSettingsIntegrationAll';

describe('getSettingsIntegrationAll', () => {
  it('should return null if imageUrl is null', () => {
    expect(
      getSettingsIntegrationAll({
        isAirtableIntegrationActive: true,
        isAirtableIntegrationEnabled: true,
        isPostgresqlIntegrationActive: true,
        isPostgresqlIntegrationEnabled: true,
        isStripeIntegrationActive: true,
        isStripeIntegrationEnabled: true,
      }),
    ).toStrictEqual({
      integrations: [
        {
          from: {
            image: '/images/integrations/airtable-logo.png',
            key: 'airtable',
          },
          link: '/settings/integrations/airtable',
          text: 'Airtable',
          type: 'Active',
        },
        {
          from: {
            image: '/images/integrations/postgresql-logo.png',
            key: 'postgresql',
          },
          link: '/settings/integrations/postgresql',
          text: 'PostgreSQL',
          type: 'Active',
        },
        {
          from: {
            image: '/images/integrations/stripe-logo.png',
            key: 'stripe',
          },
          link: '/settings/integrations/stripe',
          text: 'Stripe',
          type: 'Active',
        },
      ],
      key: 'all',
      title: 'All',
    });
  });
});
