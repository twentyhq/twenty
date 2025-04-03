import { taskCreatedSchema } from './task-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('taskCreatedSchema', () => {
  const taskCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'task.created',
  );

  it('should have fixtures to test against', () => {
    expect(taskCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all task.created fixtures', () => {
    for (const fixture of taskCreatedFixtures) {
      const result = taskCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonTaskFixture = fixtures.find(
      (fixture) => fixture.action !== 'task.created',
    );

    if (nonTaskFixture) {
      const result = taskCreatedSchema.safeParse(nonTaskFixture);
      expect(result.success).toBe(false);
    }
  });
});
