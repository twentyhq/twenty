import { customDomainActivatedSchema } from './custom-domain-activated';
import { fixtures } from '../../../fixtures/fixtures';

describe('customDomainActivatedSchema', () => {
  const customDomainActivatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'customDomain.activated',
  );

  it('should have fixtures to test against', () => {
    expect(customDomainActivatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all customDomain.activated fixtures', () => {
    for (const fixture of customDomainActivatedFixtures) {
      const result = customDomainActivatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCustomDomainFixture = fixtures.find(
      (fixture) => fixture.action !== 'customDomain.activated',
    );

    if (nonCustomDomainFixture) {
      const result = customDomainActivatedSchema.safeParse(
        nonCustomDomainFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});