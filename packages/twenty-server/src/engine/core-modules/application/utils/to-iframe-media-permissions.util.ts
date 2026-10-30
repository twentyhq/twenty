import { isArray, isObject, isString } from '@sniptt/guards';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';

export const toIframeMediaPermissions = (
  permissions: unknown,
): IframeMediaPermission[] => {
  if (!isArray(permissions)) {
    return [];
  }

  const permissionsByOrigin = new Map<string, IframeMediaPermission>();

  for (const permission of permissions) {
    if (
      !isObject(permission) ||
      !('origin' in permission) ||
      !isString(permission.origin)
    ) {
      continue;
    }

    const origin = normalizeIframeOrigin(permission.origin, {
      isHttpsOnly: true,
    });
    const microphone =
      'microphone' in permission && permission.microphone === true;
    const camera = 'camera' in permission && permission.camera === true;

    if (!isDefined(origin) || (!microphone && !camera)) {
      continue;
    }

    const existingPermission = permissionsByOrigin.get(origin);

    permissionsByOrigin.set(origin, {
      origin,
      microphone: microphone || (existingPermission?.microphone ?? false),
      camera: camera || (existingPermission?.camera ?? false),
    });
  }

  return [...permissionsByOrigin.values()];
};
