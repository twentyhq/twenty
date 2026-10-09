import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { isFathomMediaSettled } from 'src/logic-functions/utils/is-fathom-media-settled.util';

export const isFathomCallRecordingImportComplete = (
  callRecording: Pick<
    CallRecordingSyncState,
    'hasTranscript' | 'hasVideo' | 'hasAudio' | 'failureReason'
  >,
): boolean =>
  callRecording.hasTranscript && isFathomMediaSettled(callRecording);
