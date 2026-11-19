import {
  type FieldRestrictionsManifest,
  type ObjectRecordsPermissionsManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

export const fromFlatObjectPermissionToObjectRecordsPermissionsManifest = ({
  flatObjectPermission,
}: {
  flatObjectPermission: UniversalFlatObjectPermission;
}): Omit<
  ObjectRecordsPermissionsManifest,
  'rowLevelRecordsPermissions' | keyof FieldRestrictionsManifest
> => ({
  universalIdentifier: flatObjectPermission.universalIdentifier,
  objectUniversalIdentifier:
    flatObjectPermission.objectMetadataUniversalIdentifier,
  ...(isDefined(flatObjectPermission.canReadObjectRecords)
    ? { canReadAllRecords: flatObjectPermission.canReadObjectRecords }
    : {}),
  ...(isDefined(flatObjectPermission.canCreateObjectRecords)
    ? { canCreateAllRecords: flatObjectPermission.canCreateObjectRecords }
    : {}),
  ...(isDefined(flatObjectPermission.canUpdateObjectRecords)
    ? { canUpdateAllRecords: flatObjectPermission.canUpdateObjectRecords }
    : {}),
  ...(isDefined(flatObjectPermission.canSoftDeleteObjectRecords)
    ? {
        canSoftDeleteAllRecords:
          flatObjectPermission.canSoftDeleteObjectRecords,
      }
    : {}),
  ...(isDefined(flatObjectPermission.canDestroyObjectRecords)
    ? { canDestroyAllRecords: flatObjectPermission.canDestroyObjectRecords }
    : {}),
});
