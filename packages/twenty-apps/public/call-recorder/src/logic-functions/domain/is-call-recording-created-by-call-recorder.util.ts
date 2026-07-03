import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { CALL_RECORDER_CREATED_BY_SOURCE } from 'src/logic-functions/constants/call-recorder-created-by-source';

export const isCallRecordingCreatedByCallRecorder = (createdBy: {
  source?: string;
  name?: string;
}): boolean =>
  createdBy.source === CALL_RECORDER_CREATED_BY_SOURCE &&
  createdBy.name === APP_DISPLAY_NAME;
