import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

// An object missing from the role's permissions (e.g. created after they were loaded) gets the defaults
export const getObjectPermissionsForObject = (
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId,
  objectMetadataId: string,
): ObjectRecordsPermissions =>
  objectPermissionsByObjectMetadataId[objectMetadataId] ??
  getDefaultObjectPermissions();
