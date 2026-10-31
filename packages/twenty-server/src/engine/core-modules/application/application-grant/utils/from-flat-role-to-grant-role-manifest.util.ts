import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatObjectPermissionToObjectPermissionManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-permission-to-object-permission-manifest.util';
import { fromFlatRoleToRoleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-role-to-role-manifest.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

// Field and row-level restrictions are left out: they are the admin's, never part of a request
export const fromFlatRoleToGrantRoleManifest = ({
  flatRole,
  flatObjectPermissionMaps,
  flatRolePermissionFlagMaps,
}: {
  flatRole: FlatRole;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectPermissionMaps' | 'flatRolePermissionFlagMaps'
>): RoleManifest => {
  const objectPermissions = flatRole.objectPermissionUniversalIdentifiers
    .map(
      (universalIdentifier) =>
        flatObjectPermissionMaps.byUniversalIdentifier[universalIdentifier],
    )
    .filter(isDefined)
    .map((flatObjectPermission) => {
      const { universalIdentifier: _universalIdentifier, ...objectPermission } =
        fromFlatObjectPermissionToObjectPermissionManifest({
          flatObjectPermission,
        });

      return objectPermission;
    });

  const permissionFlagUniversalIdentifiers =
    flatRole.rolePermissionFlagUniversalIdentifiers
      .map(
        (universalIdentifier) =>
          flatRolePermissionFlagMaps.byUniversalIdentifier[universalIdentifier]
            ?.permissionFlagUniversalIdentifier,
      )
      .filter(isDefined);

  return {
    ...fromFlatRoleToRoleManifest({ flatRole }),
    objectPermissions,
    permissionFlagUniversalIdentifiers,
  };
};
