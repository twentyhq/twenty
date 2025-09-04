import { type Role, type WorkspaceMember } from '~/generated/graphql';

// Workspace member without personal preferences (what we get from partial queries)
export type PartialWorkspaceMember = Omit<
  WorkspaceMember,
  'colorScheme' | 'locale' | 'timeZone' | 'dateFormat' | 'timeFormat' | 'calendarStartDay' | 'createdAt' | 'updatedAt' | 'userId'
>;

// Role with partial workspace members (what we get from getRoles query)
export type RoleWithPartialMembers = Omit<Role, 'workspaceMembers'> & {
  workspaceMembers: PartialWorkspaceMember[];
};
