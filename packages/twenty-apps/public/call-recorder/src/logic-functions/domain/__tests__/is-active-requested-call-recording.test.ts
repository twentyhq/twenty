import { describe, expect, it } from 'vitest';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { isActiveRequestedCallRecording } from 'src/logic-functions/domain/is-active-requested-call-recording.util';

describe('isActiveRequestedCallRecording', () => {
  it('accepts a requested recording in a non-terminal status', () => {
    expect(
      isActiveRequestedCallRecording({
        id: 'call-recording-1',
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
        status: 'SCHEDULED',
      }),
    ).toBe(true);
  });

  it('rejects a canceled request', () => {
    expect(
      isActiveRequestedCallRecording({
        id: 'call-recording-1',
        recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
        status: 'SCHEDULED',
      }),
    ).toBe(false);
  });

  it('rejects a terminal status', () => {
    expect(
      isActiveRequestedCallRecording({
        id: 'call-recording-1',
        recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
        status: 'COMPLETED',
      }),
    ).toBe(false);
  });

  it('rejects a missing recording', () => {
    expect(isActiveRequestedCallRecording(undefined)).toBe(false);
  });
});
