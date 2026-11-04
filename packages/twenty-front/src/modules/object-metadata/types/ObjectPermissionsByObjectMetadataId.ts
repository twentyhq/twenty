import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';

export type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectRecordsPermissionsWithObjectMetadataId
>;
