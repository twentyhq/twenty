import { companyCreatedSchema } from './company-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('companyCreatedSchema', () => {
  const companyCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'company.created',
  );

  it('should have fixtures to test against', () => {
    expect(companyCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all company.created fixtures', () => {
    for (const fixture of companyCreatedFixtures) {
      const result = companyCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCompanyFixture = fixtures.find(
      (fixture) => fixture.action !== 'company.created',
    );

    if (nonCompanyFixture) {
      const result = companyCreatedSchema.safeParse(nonCompanyFixture);
      expect(result.success).toBe(false);
    }
  });
});
