import { mapMediaCaptureErrorToFailureReason } from '@/front-components/media-capture/utils/mapMediaCaptureErrorToFailureReason';

describe('mapMediaCaptureErrorToFailureReason', () => {
  it('should map NotAllowedError to permission-denied', () => {
    expect(
      mapMediaCaptureErrorToFailureReason(
        new DOMException('denied', 'NotAllowedError'),
      ),
    ).toBe('permission-denied');
  });

  it('should map SecurityError to blocked', () => {
    expect(
      mapMediaCaptureErrorToFailureReason(
        new DOMException('blocked', 'SecurityError'),
      ),
    ).toBe('blocked');
  });

  it('should map NotFoundError to no-device', () => {
    expect(
      mapMediaCaptureErrorToFailureReason(
        new DOMException('missing', 'NotFoundError'),
      ),
    ).toBe('no-device');
  });

  it('should map NotReadableError to device-in-use', () => {
    expect(
      mapMediaCaptureErrorToFailureReason(
        new DOMException('busy', 'NotReadableError'),
      ),
    ).toBe('device-in-use');
  });

  it('should map anything else to unknown', () => {
    expect(mapMediaCaptureErrorToFailureReason(new Error('boom'))).toBe(
      'unknown',
    );
    expect(mapMediaCaptureErrorToFailureReason(undefined)).toBe('unknown');
  });
});
