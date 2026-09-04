import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';

// A Fathom recording is only done once its transcript is in and its media has
// either landed or been settled as unavailable. Media arrives minutes after the
// transcript, so a recording waiting on it stays in PROCESSING.
export const resolveCallRecordingStatus = ({
  hasTranscript,
  isMediaSettled,
}: {
  hasTranscript: boolean;
  isMediaSettled: boolean;
}): NonNullable<CallRecordingSyncFields['status']> =>
  hasTranscript && isMediaSettled ? 'COMPLETED' : 'PROCESSING';
