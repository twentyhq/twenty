import { describe, expect, it } from 'vitest';

import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { buildCallRecordingRequestFollowUpJobId } from 'src/logic-functions/domain/build-call-recording-request-follow-up-job-id.util';

const CALL_RECORDING_ID = '0b4e9a3c-6f61-4a52-9d55-3f0f4d7b6e21';
const WINDOW_START = new Date('2026-01-01T12:00:00.000Z');

const minutesAfterWindowStart = (minutes: number): Date =>
  new Date(WINDOW_START.getTime() + minutes * MILLISECONDS_PER_MINUTE);

describe('buildCallRecordingRequestFollowUpJobId', () => {
  it('gives follow-ups of a recording due within the same five minutes one job id', () => {
    expect(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 0,
        dueAt: minutesAfterWindowStart(0),
      }),
    ).toBe(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 0,
        dueAt: minutesAfterWindowStart(4.9),
      }),
    );
  });

  it('gives a follow-up due in a later window its own job id', () => {
    expect(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 0,
        dueAt: minutesAfterWindowStart(0),
      }),
    ).not.toBe(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 0,
        dueAt: minutesAfterWindowStart(5),
      }),
    );
  });

  it('gives a re-armed follow-up its own job id even when due in the same window', () => {
    expect(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 0,
        dueAt: minutesAfterWindowStart(0),
      }),
    ).not.toBe(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 1,
        dueAt: minutesAfterWindowStart(1),
      }),
    );
  });

  it('gives each recording its own job id', () => {
    expect(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 0,
        dueAt: WINDOW_START,
      }),
    ).not.toBe(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: 'a51d7d2c-2f6c-4b8e-8f0e-0c1f5c9e7d40',
        attempt: 0,
        dueAt: WINDOW_START,
      }),
    );
  });

  it('stays within the queue job id format', () => {
    expect(
      buildCallRecordingRequestFollowUpJobId({
        callRecordingId: CALL_RECORDING_ID,
        attempt: 12,
        dueAt: WINDOW_START,
      }),
    ).toMatch(/^[A-Za-z0-9_.-]{1,128}$/);
  });
});
