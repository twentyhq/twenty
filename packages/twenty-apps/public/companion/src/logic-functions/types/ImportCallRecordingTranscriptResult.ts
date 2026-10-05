import { type CallRecordingUpdateFields } from 'src/logic-functions/types/CallRecordingUpdateFields';

type CallRecordingTranscriptArtifactUpdateFields = Pick<
  CallRecordingUpdateFields,
  'companionFailureReason' | 'status' | 'transcript'
>;

export type ImportCallRecordingTranscriptResult = {
  updateData: CallRecordingTranscriptArtifactUpdateFields;
  requestedTranscript: boolean;
};
