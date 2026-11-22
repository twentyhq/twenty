import { type DictationFailureReason } from '@/ai-chat/dictation/types/DictationFailureReason';

export const mapMediaDeviceError = (error: unknown): DictationFailureReason => {
  const name = error instanceof Error ? error.name : '';

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'permission-denied';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'no-device';
    case 'NotReadableError':
      return 'no-device';
    default:
      return 'engine-error';
  }
};
