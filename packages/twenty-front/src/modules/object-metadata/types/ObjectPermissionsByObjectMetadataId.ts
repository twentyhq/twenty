import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';

export type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectPermissionsWithObjectMetadataId
>;
