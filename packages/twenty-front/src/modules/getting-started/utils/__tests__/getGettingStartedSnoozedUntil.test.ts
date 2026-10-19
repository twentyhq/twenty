import { getGettingStartedSnoozedUntil } from '@/getting-started/utils/getGettingStartedSnoozedUntil';

describe('getGettingStartedSnoozedUntil', () => {
  it.each([
    {
      description: 'snoozes until the next local midnight across spring DST',
      now: '2026-03-29T00:30:00Z',
      timeZone: 'Europe/Paris',
      expected: '2026-03-29T22:00:00.000Z',
    },
    {
      description: 'snoozes until the next local midnight behind UTC',
      now: '2026-01-01T02:00:00Z',
      timeZone: 'America/Los_Angeles',
      expected: '2026-01-01T08:00:00.000Z',
    },
  ])('$description', ({ now, timeZone, expected }) => {
    expect(
      getGettingStartedSnoozedUntil({
        option: 'tomorrow',
        now: new Date(now),
        timeZone,
        trialEnd: null,
      }),
    ).toBe(expected);
  });

  it.each([
    {
      description: 'snoozes until exactly 72 hours before the trial ends',
      trialEnd: new Date('2026-04-05T12:34:00Z'),
      expected: '2026-04-02T12:34:00.000Z',
    },
    {
      description: 'returns null once the last three days have started',
      trialEnd: new Date('2026-03-30T12:00:00Z'),
      expected: null,
    },
    {
      description: 'returns null without a trial end',
      trialEnd: null,
      expected: null,
    },
  ])('$description', ({ trialEnd, expected }) => {
    expect(
      getGettingStartedSnoozedUntil({
        option: 'lastThreeDays',
        now: new Date('2026-03-28T22:30:00Z'),
        timeZone: 'UTC',
        trialEnd,
      }),
    ).toBe(expected);
  });
});
