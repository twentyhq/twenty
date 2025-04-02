import { calendarChannelCreatedSchema } from './calendar-channel-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('calendarChannelCreatedSchema', () => {
  const calendarChannelCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'calendarChannel.created',
  );

  it('should have fixtures to test against', () => {
    expect(calendarChannelCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all calendarChannel.created fixtures', () => {
    for (const fixture of calendarChannelCreatedFixtures) {
      const result = calendarChannelCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonCalendarChannelFixture = fixtures.find(
      (fixture) => fixture.action !== 'calendarChannel.created',
    );

    if (nonCalendarChannelFixture) {
      const result = calendarChannelCreatedSchema.safeParse(
        nonCalendarChannelFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
