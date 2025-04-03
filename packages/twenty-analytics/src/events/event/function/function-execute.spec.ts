import { functionExecuteSchema } from './function-execute';
import { fixtures } from '../../../fixtures/fixtures';

describe('functionExecuteSchema', () => {
  const functionExecuteFixtures = fixtures.filter(
    (fixture) => fixture.action === 'function.execute',
  );

  it('should have fixtures to test against', () => {
    expect(functionExecuteFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all function.execute fixtures', () => {
    for (const fixture of functionExecuteFixtures) {
      const result = functionExecuteSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonFunctionExecuteFixture = fixtures.find(
      (fixture) => fixture.action !== 'function.execute',
    );

    if (nonFunctionExecuteFixture) {
      const result = functionExecuteSchema.safeParse(nonFunctionExecuteFixture);
      expect(result.success).toBe(false);
    }
  });
});
