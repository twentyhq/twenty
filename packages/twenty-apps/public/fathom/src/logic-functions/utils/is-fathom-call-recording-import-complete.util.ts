import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';
import { isFathomMediaSettled } from 'src/logic-functions/utils/is-fathom-media-settled.util';

export const isFathomCallRecordingImportComplete = (
  callRecording: Pick<
    CallRecordingMediaState,
    'hasTranscript' | 'hasVideo' | 'hasAudio' | 'failureReason'
  >,
): boolean =>
  callRecording.hasTranscript && isFathomMediaSettled(callRecording);
