import { describe, expect, it } from 'vitest';

import { hasCallRecordingAttempt } from 'src/logic-functions/domain/has-call-recording-attempt.util';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';

describe('hasCallRecordingAttempt', () => {
  it('is false without any call recording', () => {
    expect(hasCallRecordingAttempt([])).toBe(false);
  });

  it('is false when every request was canceled', () => {
    expect(
      hasCallRecordingAttempt([
        {
          id: 'call-recording-1',
          recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
        },
      ]),
    ).toBe(false);
  });

  it('is true for a requested recording', () => {
    expect(
      hasCallRecordingAttempt([
        {
          id: 'call-recording-1',
          recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
        },
        {
          id: 'call-recording-2',
          recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
        },
      ]),
    ).toBe(true);
  });

  it('is true for a manual recording without a request status', () => {
    expect(hasCallRecordingAttempt([{ id: 'call-recording-1' }])).toBe(true);
  });
});
