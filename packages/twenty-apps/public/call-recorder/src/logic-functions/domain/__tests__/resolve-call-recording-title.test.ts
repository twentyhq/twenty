import { describe, expect, it } from 'vitest';

import { resolveCallRecordingTitle } from 'src/logic-functions/domain/resolve-call-recording-title.util';

describe('resolveCallRecordingTitle', () => {
  it('uses a visible calendar event title', () => {
    expect(
      resolveCallRecordingTitle({
        title: '  Customer Sync  ',
        startsAt: '2026-01-01T13:00:00.000Z',
      }),
    ).toBe('Customer Sync');
  });

  it('falls back to the calendar event start time when the title is unavailable', () => {
    expect(
      resolveCallRecordingTitle({
        title: undefined,
        startsAt: '2026-01-01T13:00:00.000Z',
      }),
    ).toBe('Call recording - Jan 1, 2026, 1:00 PM UTC');
  });

  it('uses a generic fallback when the title and start time are unavailable', () => {
    expect(
      resolveCallRecordingTitle({
        title: undefined,
        startsAt: undefined,
      }),
    ).toBe('Call recording');
  });
});
