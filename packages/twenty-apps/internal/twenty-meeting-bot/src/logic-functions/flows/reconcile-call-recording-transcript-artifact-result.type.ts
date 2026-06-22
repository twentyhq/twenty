import { type CallRecordingUpdateFields } from 'src/logic-functions/data/update-call-recording.util';

type CallRecordingTranscriptArtifactUpdateFields = Pick<
  CallRecordingUpdateFields,
  'status' | 'transcript'
>;

export type ReconcileCallRecordingTranscriptArtifactResult = {
  updateData: CallRecordingTranscriptArtifactUpdateFields;
  requestedTranscript: boolean;
};
