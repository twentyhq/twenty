import { viewSortCreatedSchema } from './view-sort-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('viewSortCreatedSchema', () => {
  const viewSortCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'viewSort.created',
  );

  it('should have fixtures to test against', () => {
    expect(viewSortCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all viewSort.created fixtures', () => {
    for (const fixture of viewSortCreatedFixtures) {
      const result = viewSortCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonViewSortFixture = fixtures.find(
      (fixture) => fixture.action !== 'viewSort.created',
    );

    if (nonViewSortFixture) {
      const result = viewSortCreatedSchema.safeParse(nonViewSortFixture);
      expect(result.success).toBe(false);
    }
  });
});
