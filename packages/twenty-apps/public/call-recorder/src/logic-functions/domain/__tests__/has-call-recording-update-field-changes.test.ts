import { describe, expect, it } from 'vitest';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { hasCallRecordingUpdateFieldChanges } from 'src/logic-functions/domain/has-call-recording-update-field-changes.util';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

const CALL_RECORDING: CallRecordingRecord = {
  id: 'call-recording-1',
  title: 'Customer Sync',
  status: CallRecordingStatus.SCHEDULED,
  recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
  calendarEventId: 'calendar-event-1',
  externalBotId: 'recall-bot-1',
};

describe('hasCallRecordingUpdateFieldChanges', () => {
  it('returns false when every update field already matches', () => {
    expect(
      hasCallRecordingUpdateFieldChanges({
        callRecording: CALL_RECORDING,
        updateFields: {
          title: 'Customer Sync',
          status: CallRecordingStatus.SCHEDULED,
          recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
          calendarEventId: 'calendar-event-1',
        },
      }),
    ).toBe(false);
  });

  it('returns true when an update field differs', () => {
    expect(
      hasCallRecordingUpdateFieldChanges({
        callRecording: CALL_RECORDING,
        updateFields: { title: 'Renamed Customer Sync' },
      }),
    ).toBe(true);
  });

  it('treats clearing an absent field as no change', () => {
    expect(
      hasCallRecordingUpdateFieldChanges({
        callRecording: CALL_RECORDING,
        updateFields: { callRecorderFailureReason: null },
      }),
    ).toBe(false);
  });

  it('returns true when clearing a field that has a value', () => {
    expect(
      hasCallRecordingUpdateFieldChanges({
        callRecording: CALL_RECORDING,
        updateFields: { externalBotId: null },
      }),
    ).toBe(true);
  });

  it('returns false for an empty update', () => {
    expect(
      hasCallRecordingUpdateFieldChanges({
        callRecording: CALL_RECORDING,
        updateFields: {},
      }),
    ).toBe(false);
  });
});
