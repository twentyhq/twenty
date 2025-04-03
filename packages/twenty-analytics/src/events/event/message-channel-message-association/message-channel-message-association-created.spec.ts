import { messageChannelMessageAssociationCreatedSchema } from './message-channel-message-association-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('messageChannelMessageAssociationCreatedSchema', () => {
  const messageChannelMessageAssociationCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'messageChannelMessageAssociation.created',
  );

  it('should have fixtures to test against', () => {
    expect(
      messageChannelMessageAssociationCreatedFixtures.length,
    ).toBeGreaterThan(0);
  });

  it('should validate all messageChannelMessageAssociation.created fixtures', () => {
    for (const fixture of messageChannelMessageAssociationCreatedFixtures) {
      const result =
        messageChannelMessageAssociationCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonMessageChannelMessageAssociationFixture = fixtures.find(
      (fixture) =>
        fixture.action !== 'messageChannelMessageAssociation.created',
    );

    if (nonMessageChannelMessageAssociationFixture) {
      const result = messageChannelMessageAssociationCreatedSchema.safeParse(
        nonMessageChannelMessageAssociationFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
