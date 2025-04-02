import { calendarEventParticipantCreatedSchema } from './calendar-event-participant-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('calendarEventParticipantCreatedSchema', () => {
  const calendarEventParticipantCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'calendarEventParticipant.created',
  );

  it('should have fixtures to test against', () => {
    expect(calendarEventParticipantCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all calendarEventParticipant.created fixtures', () => {
    for (const fixture of calendarEventParticipantCreatedFixtures) {
      const result = calendarEventParticipantCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCalendarEventParticipantFixture = fixtures.find(
      (fixture) => fixture.action !== 'calendarEventParticipant.created',
    );

    if (nonCalendarEventParticipantFixture) {
      const result = calendarEventParticipantCreatedSchema.safeParse(
        nonCalendarEventParticipantFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
