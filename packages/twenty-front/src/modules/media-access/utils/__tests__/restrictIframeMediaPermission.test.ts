import { restrictIframeMediaPermission } from '@/media-access/utils/restrictIframeMediaPermission';

const PERMISSION = {
  origin: 'https://phone.example.com',
  microphone: true,
  camera: true,
};

describe('restrictIframeMediaPermission', () => {
  it('keeps only the capabilities the application holds', () => {
    expect(
      restrictIframeMediaPermission({
        permission: PERMISSION,
        capabilities: ['camera'],
      }),
    ).toEqual({ origin: PERMISSION.origin, microphone: false, camera: true });
  });

  it('returns no permission when the application holds none of the capabilities', () => {
    expect(
      restrictIframeMediaPermission({
        permission: PERMISSION,
        capabilities: [],
      }),
    ).toBeNull();
  });

  it('returns no permission when the origin is not approved', () => {
    expect(
      restrictIframeMediaPermission({
        permission: null,
        capabilities: ['microphone', 'camera'],
      }),
    ).toBeNull();
  });
});
