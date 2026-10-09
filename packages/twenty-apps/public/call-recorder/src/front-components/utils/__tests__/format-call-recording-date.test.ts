import { describe, expect, it, vi } from 'vitest';

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

  it('reuses one formatter per locale', () => {
    let createdDateTimeFormatCount = 0;
    const OriginalDateTimeFormat = Intl.DateTimeFormat;

    class CountingDateTimeFormat extends OriginalDateTimeFormat {
      constructor(...args: ConstructorParameters<typeof Intl.DateTimeFormat>) {
        super(...args);
        createdDateTimeFormatCount += 1;
      }
    }

    vi.stubGlobal('Intl', { DateTimeFormat: CountingDateTimeFormat });

    try {
      formatCallRecordingDate({
        dateTime: '2026-03-15T12:00:00.000Z',
        locale: 'en-GB',
      });
      formatCallRecordingDate({
        dateTime: '2026-03-16T12:00:00.000Z',
        locale: 'en-GB',
      });
    } finally {
      vi.unstubAllGlobals();
    }

    expect(createdDateTimeFormatCount).toBe(1);
  });
});
