import { viewCreatedSchema } from './view-created';
import { fixtures } from '../../../../tests/fixtures';

describe('viewCreatedSchema', () => {
  const viewCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'view.created',
  );

  it('should have fixtures to test against', () => {
    expect(viewCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all view.created fixtures', () => {
    for (const fixture of viewCreatedFixtures) {
      const result = viewCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonViewFixture = fixtures.find(
      (fixture) => fixture.action !== 'view.created',
    );

    if (nonViewFixture) {
      const result = viewCreatedSchema.safeParse(nonViewFixture);
      expect(result.success).toBe(false);
    }
  });
});
