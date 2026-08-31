import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { type DictationFailureReason } from '@/ai/dictation/types/DictationFailureReason';

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
      return t`Speech recognition could not be reached. Check your connection.`;
    case 'engine-error':
      return t`Dictation failed. Try again.`;
    default:
      return assertUnreachable(reason);
  }
};
