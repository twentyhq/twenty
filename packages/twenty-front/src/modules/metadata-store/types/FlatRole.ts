import { type Role } from '~/generated-metadata/graphql';

export type FlatRole = Omit<
  Role,
  | 'agents'
  | 'apiKeys'
  | 'workspaceMembers'
  | 'fieldPermissions'
  | 'objectPermissions'
  | 'permissionFlags'
  | 'rowLevelPermissionPredicateGroups'
  | 'rowLevelPermissionPredicates'
>;
