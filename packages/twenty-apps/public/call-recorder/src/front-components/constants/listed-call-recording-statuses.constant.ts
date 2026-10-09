import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Only calls that actually happened; scheduled, failed and skipped ones are
// not recordings yet.
export const LISTED_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
  CallRecordingStatus.COMPLETED,
];
