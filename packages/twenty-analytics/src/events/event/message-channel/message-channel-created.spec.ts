import { messageChannelCreatedSchema } from './message-channel-created';
import { fixtures } from '../../../../tests/fixtures';

describe('messageChannelCreatedSchema', () => {
  const messageChannelCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'messageChannel.created',
  );

  it('should have fixtures to test against', () => {
    expect(messageChannelCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all messageChannel.created fixtures', () => {
    for (const fixture of messageChannelCreatedFixtures) {
      const result = messageChannelCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonMessageChannelFixture = fixtures.find(
      (fixture) => fixture.action !== 'messageChannel.created',
    );

    if (nonMessageChannelFixture) {
      const result = messageChannelCreatedSchema.safeParse(
        nonMessageChannelFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
