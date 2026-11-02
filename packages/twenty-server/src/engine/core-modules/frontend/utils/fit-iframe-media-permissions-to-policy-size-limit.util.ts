import { type IframeMediaPermission } from 'twenty-shared/types';

import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';
import { isIframeMediaPermissionsPolicyWithinSizeLimit } from 'src/engine/core-modules/frontend/utils/is-iframe-media-permissions-policy-within-size-limit.util';

export const fitIframeMediaPermissionsToPolicySizeLimit = ({
  permissions,
  reservedPermissions = [],
}: {
  permissions: IframeMediaPermission[];
  reservedPermissions?: IframeMediaPermission[];
}): IframeMediaPermission[] => {
  let fittingPermissions = toIframeMediaPermissions(reservedPermissions);

  for (const permission of permissions) {
    const candidatePermissions = toIframeMediaPermissions([
      ...fittingPermissions,
      permission,
    ]);

    if (!isIframeMediaPermissionsPolicyWithinSizeLimit(candidatePermissions)) {
      break;
    }

    fittingPermissions = candidatePermissions;
  }

  return fittingPermissions;
};
