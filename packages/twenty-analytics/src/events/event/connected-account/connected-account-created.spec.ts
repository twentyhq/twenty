import { connectedAccountCreatedSchema } from './connected-account-created';
import { fixtures } from '../../../../tests/fixtures';

describe('connectedAccountCreatedSchema', () => {
  const connectedAccountCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'connectedAccount.created',
  );

  it('should have fixtures to test against', () => {
    expect(connectedAccountCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all connectedAccount.created fixtures', () => {
    for (const fixture of connectedAccountCreatedFixtures) {
      const result = connectedAccountCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonConnectedAccountFixture = fixtures.find(
      (fixture) => fixture.action !== 'connectedAccount.created',
    );

    if (nonConnectedAccountFixture) {
      const result = connectedAccountCreatedSchema.safeParse(
        nonConnectedAccountFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
