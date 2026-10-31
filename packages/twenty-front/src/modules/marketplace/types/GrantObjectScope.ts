import { type ObjectPermissionAction } from 'twenty-shared/application';

export type GrantObjectScope = {
  action: ObjectPermissionAction;
  allObjects: boolean;
  objectMetadataIds: string[];
};
