import { describe, expect, it } from 'vitest';

import { formatCallRecordingDuration } from 'src/front-components/utils/format-call-recording-duration.util';

const START = '2026-03-15T10:00:00.000Z';

describe('formatCallRecordingDuration', () => {
  it.each([
    ['2026-03-15T10:00:00.000Z', '0s'],
    ['2026-03-15T10:00:42.000Z', '42s'],
    ['2026-03-15T10:00:59.600Z', '1m'],
    ['2026-03-15T10:12:30.000Z', '12m'],
    ['2026-03-15T10:59:59.000Z', '59m'],
    ['2026-03-15T11:00:00.000Z', '1h 00m'],
    ['2026-03-15T11:05:00.000Z', '1h 05m'],
    ['2026-03-15T12:45:10.000Z', '2h 45m'],
  ])('formats a call ending at %s as %s', (endedAt, expectedDuration) => {
    expect(formatCallRecordingDuration({ startedAt: START, endedAt })).toBe(
      expectedDuration,
    );
  });

  it.each([
    { startedAt: null, endedAt: '2026-03-15T11:00:00.000Z' },
    { startedAt: START, endedAt: null },
    { startedAt: START, endedAt: undefined },
    { startedAt: 'not a date', endedAt: '2026-03-15T11:00:00.000Z' },
  ])('omits the duration when it is unknown (%j)', (callRecording) => {
    expect(formatCallRecordingDuration(callRecording)).toBeUndefined();
  });

  it('omits a negative duration', () => {
    expect(
      formatCallRecordingDuration({
        startedAt: START,
        endedAt: '2026-03-15T09:00:00.000Z',
      }),
    ).toBeUndefined();
  });
});
