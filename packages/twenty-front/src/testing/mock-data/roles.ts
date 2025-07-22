import { Role } from '~/generated/graphql';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const rolesMock: Role[] = [
  {
    __typename: 'Role',
    id: '1',
    label: 'Admin',
    description: 'Full access to all workspace features and settings',
    icon: 'IconSettings',
    canDestroyAllObjectRecords: true,
    canReadAllObjectRecords: true,
    canSoftDeleteAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
    canUpdateAllSettings: true,
    isEditable: false,
    workspaceMembers: [mockWorkspaceMembers[0]],
  },
  {
    __typename: 'Role',
    id: '2',
    label: 'Guest',
    description: 'Limited access with read-only permissions',
    icon: 'IconUser',
    canDestroyAllObjectRecords: false,
    canReadAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canUpdateAllSettings: false,
    isEditable: true,
    workspaceMembers: [mockWorkspaceMembers[1]],
  },
];

export const getRolesMock = () => {
  return rolesMock;
};
