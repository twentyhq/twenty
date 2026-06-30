import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CallRecordingTranscriptArtifactUpdateFields = Pick<
  CallRecordingUpdateFields,
  'callRecorderFailureReason' | 'status' | 'transcript'
>;

export type ReconcileCallRecordingTranscriptArtifactResult = {
  updateData: CallRecordingTranscriptArtifactUpdateFields;
  requestedTranscript: boolean;
};
