import { getInboxSnoozeOptions } from '@/inbox/utils/getInboxSnoozeOptions';

describe('getInboxSnoozeOptions', () => {
  it('should offer the evening, later today, tomorrow and next week in the afternoon', () => {
    // Thursday 3:40 pm
    const now = new Date(2026, 8, 3, 15, 40);

    const options = getInboxSnoozeOptions(now);

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

    const options = getInboxSnoozeOptions(now);

    expect(options.map((option) => option.key)).toEqual([
      'tomorrow',
      'nextWeek',
    ]);
  });

  it('should list later today before the evening in the morning', () => {
    // Thursday 9:20 am, so later today lands at 1 pm
    const now = new Date(2026, 8, 3, 9, 20);

    const options = getInboxSnoozeOptions(now);

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

    const options = getInboxSnoozeOptions(now);

    expect(options.map((option) => option.key)).toEqual([
      'thisEvening',
      'tomorrow',
      'nextWeek',
    ]);
  });
});
