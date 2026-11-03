import { isIframeMediaPermissionCovered } from '@/media-access/utils/isIframeMediaPermissionCovered';

const ORIGIN = 'https://phone.example.com';

describe('isIframeMediaPermissionCovered', () => {
  it('stays covered when the covering permission widens', () => {
    expect(
      isIframeMediaPermissionCovered({
        permission: { origin: ORIGIN, microphone: true, camera: false },
        coveringPermission: { origin: ORIGIN, microphone: true, camera: true },
      }),
    ).toBe(true);
  });

  it.each([
    { origin: ORIGIN, microphone: true, camera: false },
    { origin: ORIGIN, microphone: false, camera: true },
  ])(
    'is no longer covered when a delegated capability is revoked: %o',
    (coveringPermission) => {
      expect(
        isIframeMediaPermissionCovered({
          permission: { origin: ORIGIN, microphone: true, camera: true },
          coveringPermission,
        }),
      ).toBe(false);
    },
  );

  it.each([
    null,
    { origin: 'https://other.example.com', microphone: true, camera: true },
  ])(
    'is not covered by a missing or different-origin permission %o',
    (coveringPermission) => {
      expect(
        isIframeMediaPermissionCovered({
          permission: { origin: ORIGIN, microphone: true, camera: false },
          coveringPermission,
        }),
      ).toBe(false);
    },
  );
});
