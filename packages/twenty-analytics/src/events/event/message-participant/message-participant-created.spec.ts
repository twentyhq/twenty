import { messageParticipantCreatedSchema } from './message-participant-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('messageParticipantCreatedSchema', () => {
  const messageParticipantCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'messageParticipant.created',
  );

  it('should have fixtures to test against', () => {
    expect(messageParticipantCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all messageParticipant.created fixtures', () => {
    for (const fixture of messageParticipantCreatedFixtures) {
      const result = messageParticipantCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonMessageParticipantFixture = fixtures.find(
      (fixture) => fixture.action !== 'messageParticipant.created',
    );

    if (nonMessageParticipantFixture) {
      const result = messageParticipantCreatedSchema.safeParse(
        nonMessageParticipantFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
