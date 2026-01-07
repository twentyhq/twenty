import {
  type Role,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type WorkspaceMember,
} from '~/generated-metadata/graphql';

export type PartialWorkspaceMember = Omit<
  WorkspaceMember,
  | 'colorScheme'
  | 'locale'
  | 'timeZone'
  | 'dateFormat'
  | 'timeFormat'
  | 'calendarStartDay'
  | 'createdAt'
  | 'updatedAt'
  | 'userId'
>;

export type RoleWithPartialMembers = Omit<Role, 'workspaceMembers'> & {
  workspaceMembers: PartialWorkspaceMember[];
  rowLevelPermissionPredicates?: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroup[];
};
