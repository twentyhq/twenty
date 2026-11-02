import { isDefined } from 'twenty-shared/utils';

import { type ExplicitObjectGrants } from 'src/engine/core-modules/tool-provider/interfaces/explicit-object-grants.type';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const buildRoleExplicitObjectGrants = ({
  role,
  flatObjectPermissionMaps,
}: {
  role: Pick<
    FlatRole,
    | 'id'
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  flatObjectPermissionMaps: {
    byUniversalIdentifier: Partial<
      Record<
        string,
        Pick<
          FlatObjectPermission,
          | 'roleId'
          | 'objectMetadataUniversalIdentifier'
          | 'canReadObjectRecords'
          | 'canUpdateObjectRecords'
          | 'canSoftDeleteObjectRecords'
          | 'canDestroyObjectRecords'
        >
      >
    >;
  };
}): ExplicitObjectGrants => ({
  // role-wide grants count, as an inline scope's do: the allowlist only picks the tools a run is handed
  canReadAllObjectRecords: role.canReadAllObjectRecords,
  canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
  objectPermissions: Object.values(
    flatObjectPermissionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatObjectPermission) => flatObjectPermission.roleId === role.id)
    .map((flatObjectPermission) => ({
      objectUniversalIdentifier:
        flatObjectPermission.objectMetadataUniversalIdentifier,
      canReadObjectRecords:
        flatObjectPermission.canReadObjectRecords ?? undefined,
      canUpdateObjectRecords:
        flatObjectPermission.canUpdateObjectRecords ?? undefined,
      canSoftDeleteObjectRecords:
        flatObjectPermission.canSoftDeleteObjectRecords ?? undefined,
      canDestroyObjectRecords:
        flatObjectPermission.canDestroyObjectRecords ?? undefined,
    })),
});
