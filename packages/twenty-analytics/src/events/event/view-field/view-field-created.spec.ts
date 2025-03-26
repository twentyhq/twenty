import { viewFieldCreatedSchema } from './view-field-created';
import { fixtures } from '../../../../tests/fixtures';

describe('viewFieldCreatedSchema', () => {
  const viewFieldCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'viewField.created',
  );

  it('should have fixtures to test against', () => {
    expect(viewFieldCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all viewField.created fixtures', () => {
    for (const fixture of viewFieldCreatedFixtures) {
      const result = viewFieldCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonViewFieldFixture = fixtures.find(
      (fixture) => fixture.action !== 'viewField.created',
    );

    if (nonViewFieldFixture) {
      const result = viewFieldCreatedSchema.safeParse(nonViewFieldFixture);
      expect(result.success).toBe(false);
    }
  });
});
