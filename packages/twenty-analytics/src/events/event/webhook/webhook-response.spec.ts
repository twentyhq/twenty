import { webhookResponseSchema } from './webhook-response';
import { fixtures } from '../../../../tests/fixtures';

describe('webhookResponseSchema', () => {
  const webhookResponseFixtures = fixtures.filter(
    (fixture) => fixture.action === 'webhook.response',
  );

  it('should have fixtures to test against', () => {
    expect(webhookResponseFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all webhook.response fixtures', () => {
    for (const fixture of webhookResponseFixtures) {
      const result = webhookResponseSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonWebhookResponseFixture = fixtures.find(
      (fixture) => fixture.action !== 'webhook.response',
    );

    if (nonWebhookResponseFixture) {
      const result = webhookResponseSchema.safeParse(nonWebhookResponseFixture);
      expect(result.success).toBe(false);
    }
  });
});
