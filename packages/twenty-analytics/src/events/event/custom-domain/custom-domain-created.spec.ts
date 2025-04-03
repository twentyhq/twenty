import { customDomainCreatedSchema } from './custom-domain-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('customDomainCreatedSchema', () => {
  const customDomainCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'customDomain.created',
  );

  it('should have fixtures to test against', () => {
    expect(customDomainCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all customDomain.created fixtures', () => {
    for (const fixture of customDomainCreatedFixtures) {
      const result = customDomainCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCustomDomainFixture = fixtures.find(
      (fixture) => fixture.action !== 'customDomain.created',
    );

    if (nonCustomDomainFixture) {
      const result = customDomainCreatedSchema.safeParse(
        nonCustomDomainFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});