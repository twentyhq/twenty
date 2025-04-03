import { blocklistCreatedSchema } from './blocklist-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('blocklistCreatedSchema', () => {
  const blocklistCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'blocklist.created',
  );

  it('should have fixtures to test against', () => {
    expect(blocklistCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all blocklist.created fixtures', () => {
    for (const fixture of blocklistCreatedFixtures) {
      const result = blocklistCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonBlocklistFixture = fixtures.find(
      (fixture) => fixture.action !== 'blocklist.created',
    );

    if (nonBlocklistFixture) {
      const result = blocklistCreatedSchema.safeParse(nonBlocklistFixture);
      expect(result.success).toBe(false);
    }
  });
});
