import { isNonEmptyString } from '@sniptt/guards';

import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';

export const isFathomMediaSettled = (
  callRecording: Pick<
    CallRecordingMediaState,
    'hasVideo' | 'hasAudio' | 'failureReason'
  >,
): boolean =>
  callRecording.hasVideo ||
  callRecording.hasAudio ||
  isNonEmptyString(callRecording.failureReason);
