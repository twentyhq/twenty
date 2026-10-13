import { describe, expect, it } from 'vitest';

import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { computeCallRecordingRequestFollowUpRetryDelayMs } from 'src/logic-functions/domain/compute-call-recording-request-follow-up-retry-delay.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const IN_A_WEEK = new Date(
  NOW.getTime() + 7 * 24 * MILLISECONDS_PER_HOUR,
).toISOString();

describe('computeCallRecordingRequestFollowUpRetryDelayMs', () => {
  it('retries after an hour, then four hours, then once a day', () => {
    const delaysMs = [0, 1, 2, 3, 10].map((attempt) =>
      computeCallRecordingRequestFollowUpRetryDelayMs({
        attempt,
        meetingStartsAt: IN_A_WEEK,
        now: NOW,
      }),
    );

    expect(delaysMs).toEqual([
      MILLISECONDS_PER_HOUR,
      4 * MILLISECONDS_PER_HOUR,
      24 * MILLISECONDS_PER_HOUR,
      24 * MILLISECONDS_PER_HOUR,
      24 * MILLISECONDS_PER_HOUR,
    ]);
  });

  it('retries at the meeting start when the scheduled retry would come after it', () => {
    expect(
      computeCallRecordingRequestFollowUpRetryDelayMs({
        attempt: 0,
        meetingStartsAt: new Date(
          NOW.getTime() + 20 * MILLISECONDS_PER_MINUTE,
        ).toISOString(),
        now: NOW,
      }),
    ).toBe(20 * MILLISECONDS_PER_MINUTE);
  });

  it('keeps the schedule once the meeting has started', () => {
    expect(
      computeCallRecordingRequestFollowUpRetryDelayMs({
        attempt: 1,
        meetingStartsAt: new Date(
          NOW.getTime() - 10 * MILLISECONDS_PER_MINUTE,
        ).toISOString(),
        now: NOW,
      }),
    ).toBe(4 * MILLISECONDS_PER_HOUR);
  });

  it('keeps the schedule when the meeting start is unknown', () => {
    expect(
      computeCallRecordingRequestFollowUpRetryDelayMs({
        attempt: 0,
        meetingStartsAt: undefined,
        now: NOW,
      }),
    ).toBe(MILLISECONDS_PER_HOUR);
  });
});
