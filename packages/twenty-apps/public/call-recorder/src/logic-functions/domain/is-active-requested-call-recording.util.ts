import { isUndefined } from '@sniptt/guards';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

export const isActiveRequestedCallRecording = (
  callRecording: CallRecordingRecord | undefined,
): callRecording is CallRecordingRecord =>
  !isUndefined(callRecording) &&
  callRecording.recordingRequestStatus ===
    CallRecordingRequestStatus.REQUESTED &&
  !isUndefined(callRecording.status) &&
  (NON_TERMINAL_CALL_RECORDING_STATUSES as readonly string[]).includes(
    callRecording.status,
  );
