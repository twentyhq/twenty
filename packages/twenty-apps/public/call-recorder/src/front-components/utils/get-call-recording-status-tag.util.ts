import { type CallRecordingStatusTag } from 'src/front-components/types/call-recording-status-tag.type';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Same labels and colors as core's callRecording.status select options.
export const getCallRecordingStatusTag = (
  status: string | null | undefined,
): CallRecordingStatusTag | undefined => {
  switch (status) {
    case CallRecordingStatus.RECORDING:
      return { text: 'Recording', color: 'red' };
    case CallRecordingStatus.PROCESSING:
      return { text: 'Processing', color: 'orange' };
    default:
      return undefined;
  }
};
