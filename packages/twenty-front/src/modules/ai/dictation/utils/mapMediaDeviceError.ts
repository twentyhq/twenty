import { type DictationFailureReason } from '@/ai/dictation/types/DictationFailureReason';

// getUserMedia rejects with a DOMException whose name is the only stable part
// of the failure; the message is browser-specific prose.
export const mapMediaDeviceError = (error: unknown): DictationFailureReason => {
  const name = error instanceof Error ? error.name : '';

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'permission-denied';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'no-device';
    // The device exists but another application holds it, which the user fixes
    // the same way they would a missing one.
    case 'NotReadableError':
      return 'no-device';
    default:
      return 'engine-error';
  }
};
