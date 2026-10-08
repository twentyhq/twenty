import { type DictationFailureReason } from '@/ai/dictation/types/DictationFailureReason';

// The DOMException name is the only stable part; messages are browser-specific.
export const mapMediaDeviceError = (error: unknown): DictationFailureReason => {
  const name = error instanceof Error ? error.name : '';

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'permission-denied';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'no-device';
    // Held by another app: the user fixes it the same way as a missing device.
    case 'NotReadableError':
      return 'no-device';
    default:
      return 'engine-error';
  }
};
