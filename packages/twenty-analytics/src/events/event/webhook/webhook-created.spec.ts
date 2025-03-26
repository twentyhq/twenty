import { webhookCreatedSchema } from './webhook-created';
import { fixtures } from '../../../../tests/fixtures';

describe('webhookCreatedSchema', () => {
  const webhookCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'webhook.created',
  );

  it('should have fixtures to test against', () => {
    expect(webhookCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all webhook.created fixtures', () => {
    for (const fixture of webhookCreatedFixtures) {
      const result = webhookCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonWebhookFixture = fixtures.find(
      (fixture) => fixture.action !== 'webhook.created',
    );

    if (nonWebhookFixture) {
      const result = webhookCreatedSchema.safeParse(nonWebhookFixture);
      expect(result.success).toBe(false);
    }
  });
});
