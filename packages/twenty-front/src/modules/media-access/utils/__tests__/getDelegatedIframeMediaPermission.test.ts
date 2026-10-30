import { getDelegatedIframeMediaPermission } from '@/media-access/utils/getDelegatedIframeMediaPermission';

const ACTIVATED_PERMISSION = {
  origin: 'https://phone.example.com',
  microphone: true,
  camera: false,
};

describe('getDelegatedIframeMediaPermission', () => {
  it('returns null before the user enables media access', () => {
    expect(
      getDelegatedIframeMediaPermission({
        activatedPermission: null,
        permission: ACTIVATED_PERMISSION,
      }),
    ).toBeNull();
  });

  it('keeps the activated permission while it is still granted', () => {
    expect(
      getDelegatedIframeMediaPermission({
        activatedPermission: ACTIVATED_PERMISSION,
        permission: { ...ACTIVATED_PERMISSION, camera: true },
      }),
    ).toBe(ACTIVATED_PERMISSION);
  });

  it('drops the activated permission once it is revoked', () => {
    expect(
      getDelegatedIframeMediaPermission({
        activatedPermission: ACTIVATED_PERMISSION,
        permission: null,
      }),
    ).toBeNull();
  });
});
