import { describe, expect, it } from 'vitest';

import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const BEFORE_NOW = '2026-01-01T11:00:00.000Z';
const AFTER_NOW = '2026-01-01T13:00:00.000Z';

describe('hasMeetingEnded', () => {
  it.each([
    {
      startsAt: BEFORE_NOW,
      endsAt: AFTER_NOW,
      startGraceHours: 0,
      expected: false,
    },
    {
      startsAt: BEFORE_NOW,
      endsAt: NOW.toISOString(),
      startGraceHours: 24,
      expected: true,
    },
    {
      startsAt: BEFORE_NOW,
      endsAt: undefined,
      startGraceHours: 0,
      expected: true,
    },
    {
      startsAt: BEFORE_NOW,
      endsAt: 'invalid',
      startGraceHours: 0,
      expected: true,
    },
    {
      startsAt: BEFORE_NOW,
      endsAt: undefined,
      startGraceHours: 24,
      expected: false,
    },
    {
      startsAt: BEFORE_NOW,
      endsAt: 'invalid',
      startGraceHours: 1,
      expected: true,
    },
    {
      startsAt: undefined,
      endsAt: BEFORE_NOW,
      startGraceHours: 24,
      expected: true,
    },
    {
      startsAt: undefined,
      endsAt: undefined,
      startGraceHours: 0,
      expected: false,
    },
    {
      startsAt: 'invalid',
      endsAt: 'invalid',
      startGraceHours: 0,
      expected: false,
    },
  ])(
    'resolves $startsAt / $endsAt with $startGraceHours hours of fallback grace',
    ({ expected, ...meeting }) => {
      expect(hasMeetingEnded({ ...meeting, now: NOW })).toBe(expected);
    },
  );
});
