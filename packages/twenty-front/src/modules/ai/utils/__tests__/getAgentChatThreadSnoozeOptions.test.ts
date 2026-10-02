import { getAgentChatThreadSnoozeOptions } from '@/ai/utils/getAgentChatThreadSnoozeOptions';

const SYSTEM_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

describe('getAgentChatThreadSnoozeOptions', () => {
  it('should offer the evening, later today, tomorrow and next week in the afternoon', () => {
    // Thursday 3:40 pm
    const now = new Date(2026, 8, 3, 15, 40);

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: SYSTEM_TIME_ZONE,
    });

    expect(options.map((option) => option.key)).toEqual([
      'thisEvening',
      'laterToday',
      'tomorrow',
      'nextWeek',
    ]);
    expect(options[0].date).toEqual(new Date(2026, 8, 3, 18, 0));
    expect(options[1].date).toEqual(new Date(2026, 8, 3, 18, 0 + 60));
    expect(options[2].date).toEqual(new Date(2026, 8, 4, 9, 0));
    expect(options[3].date).toEqual(new Date(2026, 8, 7, 9, 0));
  });

  it('should drop the evening once it has passed and later today once it leaves the day', () => {
    // Thursday 9:30 pm
    const now = new Date(2026, 8, 3, 21, 30);

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: SYSTEM_TIME_ZONE,
    });

    expect(options.map((option) => option.key)).toEqual([
      'tomorrow',
      'nextWeek',
    ]);
  });

  it('should list later today before the evening in the morning', () => {
    // Thursday 9:20 am, so later today lands at 1 pm
    const now = new Date(2026, 8, 3, 9, 20);

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: SYSTEM_TIME_ZONE,
    });

    expect(options.map((option) => option.key)).toEqual([
      'laterToday',
      'thisEvening',
      'tomorrow',
      'nextWeek',
    ]);
    expect(options[0].date).toEqual(new Date(2026, 8, 3, 13, 0));
  });

  it('should not offer the same moment twice', () => {
    // Thursday 2:10 pm, so later today rounds onto the evening slot
    const now = new Date(2026, 8, 3, 14, 10);

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: SYSTEM_TIME_ZONE,
    });

    expect(options.map((option) => option.key)).toEqual([
      'thisEvening',
      'tomorrow',
      'nextWeek',
    ]);
  });

  it('should round later today down when rounding up would leave the day', () => {
    // Thursday 8:30 pm
    const now = new Date(2026, 8, 3, 20, 30);

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: SYSTEM_TIME_ZONE,
    });

    expect(options.map((option) => option.key)).toEqual([
      'laterToday',
      'tomorrow',
      'nextWeek',
    ]);
    expect(options[0].date).toEqual(new Date(2026, 8, 3, 23, 0));
  });

  it('should offer next week on a Sunday', () => {
    // Sunday 3:40 pm
    const now = new Date(2026, 8, 6, 15, 40);

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: SYSTEM_TIME_ZONE,
    });

    expect(options.map((option) => option.key)).toEqual([
      'thisEvening',
      'laterToday',
      'tomorrow',
      'nextWeek',
    ]);
    expect(options[2].date).toEqual(new Date(2026, 8, 7, 9, 0));
    expect(options[3].date).toEqual(new Date(2026, 8, 14, 9, 0));
  });

  it("should land on the member's morning when their time zone differs from the browser's", () => {
    // Thursday 11:40 am in New York
    const now = new Date('2026-09-03T15:40:00.000Z');

    const options = getAgentChatThreadSnoozeOptions({
      now,
      timeZone: 'America/New_York',
    });

    expect(options.find((option) => option.key === 'tomorrow')?.date).toEqual(
      new Date('2026-09-04T13:00:00.000Z'),
    );
    expect(
      options.find((option) => option.key === 'thisEvening')?.date,
    ).toEqual(new Date('2026-09-03T22:00:00.000Z'));
  });
});
