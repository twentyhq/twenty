import { type ObjectPermissions } from 'twenty-shared/types';

// Mirrors the GraphQL ObjectPermission, whose fields are all nullable
export type CurrentUserWorkspaceObjectPermissions = {
  [Key in keyof ObjectPermissions]?: ObjectPermissions[Key] | null;
} & {
  objectMetadataId: string;
};
