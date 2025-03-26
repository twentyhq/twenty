import { calendarChannelEventAssociationCreatedSchema } from './calendar-channel-event-association-created';
import { fixtures } from '../../../../tests/fixtures';

describe('calendarChannelEventAssociationCreatedSchema', () => {
  const calendarChannelEventAssociationCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'calendarChannelEventAssociation.created',
  );

  it('should have fixtures to test against', () => {
    expect(
      calendarChannelEventAssociationCreatedFixtures.length,
    ).toBeGreaterThan(0);
  });

  it('should validate all calendarChannelEventAssociation.created fixtures', () => {
    for (const fixture of calendarChannelEventAssociationCreatedFixtures) {
      const result =
        calendarChannelEventAssociationCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCalendarChannelEventAssociationFixture = fixtures.find(
      (fixture) => fixture.action !== 'calendarChannelEventAssociation.created',
    );

    if (nonCalendarChannelEventAssociationFixture) {
      const result = calendarChannelEventAssociationCreatedSchema.safeParse(
        nonCalendarChannelEventAssociationFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
