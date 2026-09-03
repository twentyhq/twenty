import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CallRecordingTranscriptArtifactUpdateFields = Pick<
  CallRecordingUpdateFields,
  'callRecorderFailureReason' | 'status' | 'transcript'
>;

export type ImportCallRecordingTranscriptResult = {
  updateData: CallRecordingTranscriptArtifactUpdateFields;
  requestedTranscript: boolean;
  // A provider call that did not resolve the transcript one way or the other.
  // Distinct from a transcript Recall is still working on, which is a normal
  // no-op and must not burn a redelivery.
  hasRetryableFailure: boolean;
};
