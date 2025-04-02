import { serverlessFunctionExecutedSchema } from './serverless-function-executed';
import { fixtures } from '../../../fixtures/fixtures';

describe('serverlessFunctionExecutedSchema', () => {
  const serverlessFunctionExecutedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'serverlessFunction.executed',
  );

  it('should have fixtures to test against', () => {
    expect(serverlessFunctionExecutedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all serverlessFunction.executed fixtures', () => {
    for (const fixture of serverlessFunctionExecutedFixtures) {
      const result = serverlessFunctionExecutedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonServerlessFunctionFixture = fixtures.find(
      (fixture) => fixture.action !== 'serverlessFunction.executed',
    );

    if (nonServerlessFunctionFixture) {
      const result = serverlessFunctionExecutedSchema.safeParse(
        nonServerlessFunctionFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
