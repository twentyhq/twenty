import { t } from '@lingui/core/macro';

import { type DictationFailureReason } from '@/ai/dictation/types/DictationEngine';

export const getDictationFailureMessage = (
  reason: DictationFailureReason,
): string => {
  switch (reason) {
    case 'permission-denied':
      return t`Microphone access is blocked. Allow it in your browser settings to dictate.`;
    case 'no-device':
      return t`No microphone is available. Connect one and try again.`;
    case 'unsupported-surface':
      return t`Dictation is not supported in this browser.`;
    case 'engine-silent':
      return t`Dictation did not respond in this browser. Try Safari, or type instead.`;
    case 'network':
      return t`Could not reach the transcription service. Check your connection.`;
    case 'quota-exhausted':
      return t`Your workspace is out of AI credits.`;
    case 'service-unavailable':
      return t`Dictation is unavailable on this workspace right now.`;
    case 'engine-error':
      return t`Dictation failed. Try again.`;
  }
};
