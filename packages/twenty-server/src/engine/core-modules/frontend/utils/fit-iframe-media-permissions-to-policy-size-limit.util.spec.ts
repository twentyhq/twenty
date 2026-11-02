import { fitIframeMediaPermissionsToPolicySizeLimit } from 'src/engine/core-modules/frontend/utils/fit-iframe-media-permissions-to-policy-size-limit.util';
import { isIframeMediaPermissionsPolicyWithinSizeLimit } from 'src/engine/core-modules/frontend/utils/is-iframe-media-permissions-policy-within-size-limit.util';

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

    expect(fitIframeMediaPermissionsToPolicySizeLimit({ permissions })).toEqual(
      permissions,
    );
  });

  it('keeps the earliest permissions and stops at the policy size limit', () => {
    const permissions = [0, 1, 2, 3, 4, 5].map(buildLongPermission);

    expect(fitIframeMediaPermissionsToPolicySizeLimit({ permissions })).toEqual(
      permissions.slice(0, 4),
    );
  });

  it('merges additional media grants when the policy fits', () => {
    const permission = buildPermission('phone');

    expect(
      fitIframeMediaPermissionsToPolicySizeLimit({
        reservedPermissions: [{ ...permission, camera: false }],
        permissions: [{ ...permission, microphone: false }],
      }),
    ).toEqual([permission]);
  });

  it('preserves workspace grants when apps add media to the same origins', () => {
    const permissions = [0, 1, 2, 3, 4].map(buildLongPermission);
    const reservedPermissions = permissions.map((permission) => ({
      ...permission,
      camera: false,
    }));

    const fittingPermissions = fitIframeMediaPermissionsToPolicySizeLimit({
      permissions,
      reservedPermissions,
    });

    expect(fittingPermissions).toEqual([
      ...permissions.slice(0, 4),
      reservedPermissions[4],
    ]);
    expect(
      isIframeMediaPermissionsPolicyWithinSizeLimit(fittingPermissions),
    ).toBe(true);
  });

  it('preserves workspace grants when apps add new origins', () => {
    const reservedPermissions = [0, 1, 2, 3, 4]
      .map(buildLongPermission)
      .map((permission) => ({ ...permission, camera: false }));
    const permissions = [5, 6, 7, 8, 9]
      .map(buildLongPermission)
      .map((permission) => ({ ...permission, microphone: false }));

    const fittingPermissions = fitIframeMediaPermissionsToPolicySizeLimit({
      permissions,
      reservedPermissions,
    });

    expect(fittingPermissions).toEqual([
      ...reservedPermissions,
      ...permissions.slice(0, 4),
    ]);
    expect(
      isIframeMediaPermissionsPolicyWithinSizeLimit(fittingPermissions),
    ).toBe(true);
  });
});
