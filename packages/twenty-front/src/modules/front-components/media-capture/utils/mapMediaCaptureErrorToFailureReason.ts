import { type CaptureMediaFailureReason } from 'twenty-front-component-renderer';

export const mapMediaCaptureErrorToFailureReason = (
  error: unknown,
): CaptureMediaFailureReason => {
  if (!(error instanceof DOMException)) {
    return 'unknown';
  }

  switch (error.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'permission-denied';
    // Permissions-Policy denials and insecure contexts surface as
    // SecurityError, unlike a user clicking "Block" in the browser prompt.
    case 'SecurityError':
      return 'blocked';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'no-device';
    // The device exists but the OS or another application holds it — a
    // common case for softphones competing with meeting apps.
    case 'NotReadableError':
    case 'TrackStartError':
      return 'device-in-use';
    default:
      return 'unknown';
  }
};
