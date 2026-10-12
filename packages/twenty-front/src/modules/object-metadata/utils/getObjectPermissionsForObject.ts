import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';
import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';

// An object missing from the role's permissions (e.g. created after they were loaded) gets the defaults
export const getObjectPermissionsForObject = (
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId,
  objectMetadataId: string,
): ObjectPermissionsWithObjectMetadataId =>
  objectPermissionsByObjectMetadataId[objectMetadataId] ??
  getDefaultObjectPermissions(objectMetadataId);
