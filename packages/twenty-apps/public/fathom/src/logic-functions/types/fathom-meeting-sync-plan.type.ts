import { type FathomGenerateCallRecordingTitlePayload } from 'src/logic-functions/schemas/fathom-generate-call-recording-title-payload.schema';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { type FathomRecordingImportFields } from 'src/logic-functions/types/fathom-recording-import-fields.type';

export type FathomMeetingSyncPlan = {
  callRecordingId: string;
  calendarEventId: string | undefined;
  existingCallRecording: CallRecordingSyncState | undefined;
  createCallRecordingFields: CallRecordingSyncFields;
  updateCallRecordingFields: CallRecordingSyncFields;
  recordingImportFields: FathomRecordingImportFields & {
    callRecordingId: string;
    recordingId: string;
  };
  isMediaDownloadRequestNeeded: boolean;
  titleGenerationPayload: FathomGenerateCallRecordingTitlePayload | undefined;
};
