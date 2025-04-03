import { messageCreatedSchema } from './message-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('messageCreatedSchema', () => {
  const messageCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'message.created',
  );

  it('should have fixtures to test against', () => {
    expect(messageCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all message.created fixtures', () => {
    for (const fixture of messageCreatedFixtures) {
      const result = messageCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonMessageFixture = fixtures.find(
      (fixture) => fixture.action !== 'message.created',
    );

    if (nonMessageFixture) {
      const result = messageCreatedSchema.safeParse(nonMessageFixture);
      expect(result.success).toBe(false);
    }
  });
});
