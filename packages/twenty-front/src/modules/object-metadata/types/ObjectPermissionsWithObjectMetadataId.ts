import { type ObjectPermissions } from 'twenty-shared/types';

export type ObjectPermissionsWithObjectMetadataId = ObjectPermissions & {
  objectMetadataId: string;
};
