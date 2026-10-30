import { type IframeMediaPermission } from 'twenty-shared/types';

import { isIframeMediaPermissionsPolicyWithinSizeLimit } from 'src/engine/core-modules/frontend/utils/is-iframe-media-permissions-policy-within-size-limit.util';

export const fitIframeMediaPermissionsToPolicySizeLimit = (
  permissions: IframeMediaPermission[],
): IframeMediaPermission[] => {
  const fittingPermissions: IframeMediaPermission[] = [];

  for (const permission of permissions) {
    if (
      !isIframeMediaPermissionsPolicyWithinSizeLimit([
        ...fittingPermissions,
        permission,
      ])
    ) {
      break;
    }

    fittingPermissions.push(permission);
  }

  return fittingPermissions;
};
