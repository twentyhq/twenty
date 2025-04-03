import { taskTargetCreatedSchema } from './task-target-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('taskTargetCreatedSchema', () => {
  const taskTargetCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'taskTarget.created',
  );

  it('should have fixtures to test against', () => {
    expect(taskTargetCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all taskTarget.created fixtures', () => {
    for (const fixture of taskTargetCreatedFixtures) {
      const result = taskTargetCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonTaskTargetFixture = fixtures.find(
      (fixture) => fixture.action !== 'taskTarget.created',
    );

    if (nonTaskTargetFixture) {
      const result = taskTargetCreatedSchema.safeParse(nonTaskTargetFixture);
      expect(result.success).toBe(false);
    }
  });
});
