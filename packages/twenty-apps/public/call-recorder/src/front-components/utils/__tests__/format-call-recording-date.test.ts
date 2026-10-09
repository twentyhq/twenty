import { describe, expect, it } from 'vitest';

import { formatCallRecordingDate } from 'src/front-components/utils/format-call-recording-date.util';

describe('formatCallRecordingDate', () => {
  it('formats the date in the viewer locale', () => {
    expect(
      formatCallRecordingDate({
        dateTime: '2026-03-15T12:00:00.000Z',
        locale: 'en-US',
      }),
    ).toBe('Mar 15, 2026');
  });

  it('does not throw on a locale the runtime rejects', () => {
    expect(
      formatCallRecordingDate({
        dateTime: '2026-03-15T12:00:00.000Z',
        locale: 'not_a_locale!',
      }),
    ).toEqual(expect.any(String));
  });

  it.each([undefined, null, '', 'not a date'])(
    'returns nothing for %j',
    (dateTime) => {
      expect(
        formatCallRecordingDate({ dateTime, locale: 'en-US' }),
      ).toBeUndefined();
    },
  );
});
