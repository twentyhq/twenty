import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const intersectIframeMediaPermissions = ({
  permissions,
  allowedPermissions,
}: {
  permissions: readonly IframeMediaPermission[];
  allowedPermissions: readonly IframeMediaPermission[];
}): IframeMediaPermission[] =>
  permissions.flatMap((permission) => {
    const allowedPermission = allowedPermissions.find(
      (candidate) => candidate.origin === permission.origin,
    );

    if (!isDefined(allowedPermission)) {
      return [];
    }

    const microphone = permission.microphone && allowedPermission.microphone;
    const camera = permission.camera && allowedPermission.camera;

    return microphone || camera
      ? [{ origin: permission.origin, microphone, camera }]
      : [];
  });
