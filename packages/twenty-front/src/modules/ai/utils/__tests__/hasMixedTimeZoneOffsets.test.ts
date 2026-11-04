import { hasMixedTimeZoneOffsets } from '@/ai/utils/hasMixedTimeZoneOffsets';

describe('hasMixedTimeZoneOffsets', () => {
  it('should detect slots on both sides of a daylight saving time change', () => {
    expect(
      hasMixedTimeZoneOffsets({
        timeZone: 'America/Los_Angeles',
        slots: [
          {
            id: 'before-clock-change',
            startsAt: '2026-11-01T08:00:00Z',
            endsAt: '2026-11-01T08:30:00Z',
          },
          {
            id: 'after-clock-change',
            startsAt: '2026-11-01T09:00:00Z',
            endsAt: '2026-11-01T09:30:00Z',
          },
        ],
      }),
    ).toBe(true);
  });

  it('should detect a single slot spanning a daylight saving time change', () => {
    expect(
      hasMixedTimeZoneOffsets({
        timeZone: 'America/Los_Angeles',
        slots: [
          {
            id: 'across-clock-change',
            startsAt: '2026-11-01T08:30:00Z',
            endsAt: '2026-11-01T09:00:00Z',
          },
        ],
      }),
    ).toBe(true);
  });

  it('should not flag slots sharing the same offset', () => {
    expect(
      hasMixedTimeZoneOffsets({
        timeZone: 'Europe/Paris',
        slots: [
          {
            id: 'morning',
            startsAt: '2026-10-07T07:30:00Z',
            endsAt: '2026-10-07T08:00:00Z',
          },
          {
            id: 'afternoon',
            startsAt: '2026-10-07T14:00:00Z',
            endsAt: '2026-10-07T14:30:00Z',
          },
        ],
      }),
    ).toBe(false);
  });
});
