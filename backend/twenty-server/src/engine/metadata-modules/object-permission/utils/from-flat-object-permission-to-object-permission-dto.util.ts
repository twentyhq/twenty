import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';

export const fromFlatObjectPermissionToObjectPermissionDto = (
  flatObjectPermission: FlatObjectPermission,
): ObjectPermissionDTO => ({
  objectMetadataId: flatObjectPermission.objectMetadataId,
  canReadObjectRecords: flatObjectPermission.canReadObjectRecords,
  canUpdateObjectRecords: flatObjectPermission.canUpdateObjectRecords,
  canSoftDeleteObjectRecords: flatObjectPermission.canSoftDeleteObjectRecords,
  canDestroyObjectRecords: flatObjectPermission.canDestroyObjectRecords,
});
