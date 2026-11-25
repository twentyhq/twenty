import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const OPEN_SCHEDULED_CALL_RECORDING_FILTER = {
  recordingRequestStatus: { eq: CallRecordingRequestStatus.REQUESTED },
  status: { eq: CallRecordingStatus.SCHEDULED },
};
