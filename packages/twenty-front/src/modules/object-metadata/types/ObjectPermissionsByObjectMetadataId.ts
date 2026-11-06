import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export type ObjectPermissionsByObjectMetadataId = Record<
  string,
  ObjectRecordsPermissions
>;
