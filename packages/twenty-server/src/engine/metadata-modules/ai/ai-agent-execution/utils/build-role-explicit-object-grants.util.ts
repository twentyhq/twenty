import { isDefined } from 'twenty-shared/utils';

import { type ExplicitObjectGrants } from 'src/engine/core-modules/tool-provider/interfaces/explicit-object-grants.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';

// the objects the role names one by one, not its all-objects grants
export const buildRoleExplicitObjectGrants = ({
  roleId,
  flatObjectPermissionMaps,
}: {
  roleId: string;
  flatObjectPermissionMaps: Pick<
    FlatEntityMaps<FlatObjectPermission>,
    'byUniversalIdentifier'
  >;
}): ExplicitObjectGrants => ({
  objectPermissions: Object.values(
    flatObjectPermissionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((flatObjectPermission) => flatObjectPermission.roleId === roleId)
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
