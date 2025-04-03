import { apiKeyCreatedSchema } from './api-key-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('apiKeyCreatedSchema', () => {
  const apiKeyCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'apiKey.created',
  );

  it('should have fixtures to test against', () => {
    expect(apiKeyCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all apiKey.created fixtures', () => {
    for (const fixture of apiKeyCreatedFixtures) {
      const result = apiKeyCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonApiKeyFixture = fixtures.find(
      (fixture) => fixture.action !== 'apiKey.created',
    );

    if (nonApiKeyFixture) {
      const result = apiKeyCreatedSchema.safeParse(nonApiKeyFixture);
      expect(result.success).toBe(false);
    }
  });
});
