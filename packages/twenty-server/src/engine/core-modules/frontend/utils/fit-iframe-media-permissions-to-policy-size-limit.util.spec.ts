import { fitIframeMediaPermissionsToPolicySizeLimit } from 'src/engine/core-modules/frontend/utils/fit-iframe-media-permissions-to-policy-size-limit.util';

const buildPermission = (host: string) => ({
  origin: `https://${host}.example.com`,
  microphone: true,
  camera: true,
});

const buildLongPermission = (index: number) =>
  buildPermission(
    `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.phone-${index}`,
  );

describe('fitIframeMediaPermissionsToPolicySizeLimit', () => {
  it('keeps permissions that fit in the policy', () => {
    const permissions = [buildPermission('phone'), buildPermission('video')];

    expect(fitIframeMediaPermissionsToPolicySizeLimit(permissions)).toEqual(
      permissions,
    );
  });

  it('keeps the earliest permissions and stops at the policy size limit', () => {
    const permissions = [0, 1, 2, 3, 4, 5].map(buildLongPermission);

    expect(fitIframeMediaPermissionsToPolicySizeLimit(permissions)).toEqual(
      permissions.slice(0, 4),
    );
  });
});
