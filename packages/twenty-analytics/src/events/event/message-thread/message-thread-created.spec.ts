import { messageThreadCreatedSchema } from './message-thread-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('messageThreadCreatedSchema', () => {
  const messageThreadCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'messageThread.created',
  );

  it('should have fixtures to test against', () => {
    expect(messageThreadCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all messageThread.created fixtures', () => {
    for (const fixture of messageThreadCreatedFixtures) {
      const result = messageThreadCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonMessageThreadFixture = fixtures.find(
      (fixture) => fixture.action !== 'messageThread.created',
    );

    if (nonMessageThreadFixture) {
      const result = messageThreadCreatedSchema.safeParse(
        nonMessageThreadFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
