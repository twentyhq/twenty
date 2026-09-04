import { describe, expect, it } from 'vitest';

import { isStaleDefaultCallRecorderPreference } from 'src/logic-functions/domain/is-stale-default-call-recorder-preference.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');

describe('isStaleDefaultCallRecorderPreference', () => {
  it('is true for an ended meeting still carrying the default ON', () => {
    expect(
      isStaleDefaultCallRecorderPreference({
        callRecorderPreference: 'ON',
        startsAt: '2026-01-01T09:00:00.000Z',
        endsAt: '2026-01-01T10:00:00.000Z',
        now: NOW,
      }),
    ).toBe(true);
  });

  it('falls back to startsAt when the meeting has no end', () => {
    expect(
      isStaleDefaultCallRecorderPreference({
        callRecorderPreference: 'ON',
        startsAt: '2026-01-01T11:00:00.000Z',
        endsAt: undefined,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('is false for an upcoming meeting', () => {
    expect(
      isStaleDefaultCallRecorderPreference({
        callRecorderPreference: 'ON',
        startsAt: '2026-01-01T13:00:00.000Z',
        endsAt: '2026-01-01T14:00:00.000Z',
        now: NOW,
      }),
    ).toBe(false);
  });

  it('is false for an in-progress meeting', () => {
    expect(
      isStaleDefaultCallRecorderPreference({
        callRecorderPreference: 'ON',
        startsAt: '2026-01-01T11:30:00.000Z',
        endsAt: '2026-01-01T12:30:00.000Z',
        now: NOW,
      }),
    ).toBe(false);
  });

  it.each(['OFF', undefined])(
    'leaves an ended meeting alone when the preference is %s',
    (callRecorderPreference) => {
      expect(
        isStaleDefaultCallRecorderPreference({
          callRecorderPreference,
          startsAt: '2026-01-01T09:00:00.000Z',
          endsAt: '2026-01-01T10:00:00.000Z',
          now: NOW,
        }),
      ).toBe(false);
    },
  );
});
