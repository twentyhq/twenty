import { viewFilterCreatedSchema } from './view-filter-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('viewFilterCreatedSchema', () => {
  const viewFilterCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'viewFilter.created',
  );

  it('should have fixtures to test against', () => {
    expect(viewFilterCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all viewFilter.created fixtures', () => {
    for (const fixture of viewFilterCreatedFixtures) {
      const result = viewFilterCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonViewFilterFixture = fixtures.find(
      (fixture) => fixture.action !== 'viewFilter.created',
    );

    if (nonViewFilterFixture) {
      const result = viewFilterCreatedSchema.safeParse(nonViewFilterFixture);
      expect(result.success).toBe(false);
    }
  });
});
