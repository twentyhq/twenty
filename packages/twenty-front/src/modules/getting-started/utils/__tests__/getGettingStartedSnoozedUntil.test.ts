import { getGettingStartedSnoozedUntil } from '@/getting-started/utils/getGettingStartedSnoozedUntil';

describe('getGettingStartedSnoozedUntil', () => {
  it.each([
    {
      description: 'snoozes until the next local midnight',
      now: '2026-11-10T09:15:00Z',
      timeZone: 'Europe/Paris',
      expected: '2026-11-10T23:00:00.000Z',
    },
    {
      description:
        'still snoozes until midnight when called a minute before it',
      now: '2026-11-10T22:59:00Z',
      timeZone: 'Europe/Paris',
      expected: '2026-11-10T23:00:00.000Z',
    },
    {
      description: 'snoozes a full day when called exactly at midnight',
      now: '2026-11-10T23:00:00Z',
      timeZone: 'Europe/Paris',
      expected: '2026-11-11T23:00:00.000Z',
    },
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
      getGettingStartedSnoozedUntil({ now: new Date(now), timeZone }),
    ).toBe(expected);
  });
});
