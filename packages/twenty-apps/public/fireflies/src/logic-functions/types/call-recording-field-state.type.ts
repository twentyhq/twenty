import { type CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';

export type CallRecordingFieldState = {
  isTranscriptFilled: boolean;
  isSummaryFilled: boolean;
  status?:
    | typeof CALL_RECORDING_STATUS.PROCESSING
    | typeof CALL_RECORDING_STATUS.COMPLETED;
};
