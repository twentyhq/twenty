import { personCreatedSchema } from './person-created';
import { fixtures } from '../../../../tests/fixtures';

describe('personCreatedSchema', () => {
  const personCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'person.created',
  );

  it('should have fixtures to test against', () => {
    expect(personCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all person.created fixtures', () => {
    for (const fixture of personCreatedFixtures) {
      const result = personCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonPersonFixture = fixtures.find(
      (fixture) => fixture.action !== 'person.created',
    );

    if (nonPersonFixture) {
      const result = personCreatedSchema.safeParse(nonPersonFixture);
      expect(result.success).toBe(false);
    }
  });
});
