import {
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationGrantObjectScope } from 'src/engine/core-modules/application/application-grant/types/application-grant-object-scope.type';
import { materializeRoleManifestObjectPermissions } from 'src/engine/core-modules/application/application-grant/utils/materialize-role-manifest-object-permissions.util';
import { upsertObjectPermissionInRoleManifest } from 'src/engine/core-modules/application/application-grant/utils/upsert-object-permission-in-role-manifest.util';

// The grant starts as the request, with each requested "all objects" switch narrowed to the
// objects the admin picked. Rows the request names explicitly are kept as they are.
export const buildInitialGrantRoleManifest = ({
  requestedRoleManifest,
  objectScopes,
}: {
  requestedRoleManifest: RoleManifest;
  objectScopes: ApplicationGrantObjectScope[];
}): RoleManifest => {
  let grantRoleManifest = materializeRoleManifestObjectPermissions(
    requestedRoleManifest,
  );

  for (const action of OBJECT_PERMISSION_ACTIONS) {
    const roleLevelFlag = ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action];
    const scope = objectScopes.find(
      (objectScope) => objectScope.action === action,
    );

    if (
      requestedRoleManifest[roleLevelFlag] !== true ||
      !isDefined(scope?.objectUniversalIdentifiers)
    ) {
      continue;
    }

    grantRoleManifest = { ...grantRoleManifest, [roleLevelFlag]: false };

    for (const objectUniversalIdentifier of scope.objectUniversalIdentifiers) {
      const isExplicitlyDenied =
        requestedRoleManifest.objectPermissions?.find(
          (objectPermission) =>
            objectPermission.objectUniversalIdentifier ===
            objectUniversalIdentifier,
        )?.[action] === false;

      if (isExplicitlyDenied) {
        continue;
      }

      grantRoleManifest = upsertObjectPermissionInRoleManifest({
        roleManifest: grantRoleManifest,
        objectUniversalIdentifier,
        action,
        value: true,
      });
    }
  }

  return grantRoleManifest;
};
