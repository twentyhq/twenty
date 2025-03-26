import { opportunityCreatedSchema } from './opportunity-created';
import { fixtures } from '../../../../tests/fixtures';

describe('opportunityCreatedSchema', () => {
  const opportunityCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'opportunity.created',
  );

  it('should have fixtures to test against', () => {
    expect(opportunityCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all opportunity.created fixtures', () => {
    for (const fixture of opportunityCreatedFixtures) {
      const result = opportunityCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonOpportunityFixture = fixtures.find(
      (fixture) => fixture.action !== 'opportunity.created',
    );

    if (nonOpportunityFixture) {
      const result = opportunityCreatedSchema.safeParse(nonOpportunityFixture);
      expect(result.success).toBe(false);
    }
  });
});
