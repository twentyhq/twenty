import { calendarEventCreatedSchema } from './calendar-event-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('calendarEventCreatedSchema', () => {
  const calendarEventCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'calendarEvent.created',
  );

  it('should have fixtures to test against', () => {
    expect(calendarEventCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all calendarEvent.created fixtures', () => {
    for (const fixture of calendarEventCreatedFixtures) {
      const result = calendarEventCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCalendarEventFixture = fixtures.find(
      (fixture) => fixture.action !== 'calendarEvent.created',
    );

    if (nonCalendarEventFixture) {
      const result = calendarEventCreatedSchema.safeParse(
        nonCalendarEventFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
