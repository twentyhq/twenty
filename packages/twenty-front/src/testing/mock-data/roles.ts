import { Role } from '~/generated/graphql';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const rolesMock: Role[] = [
  {
    __typename: 'Role',
    id: '1',
    label: 'Admin',
    canDestroyAllObjectRecords: true,
    canReadAllObjectRecords: true,
    canSoftDeleteAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
    canUpdateAllSettings: true,
    canAccessAllTools: true,
    isEditable: false,
    workspaceMembers: [mockWorkspaceMembers[0]],
  },
  {
    __typename: 'Role',
    id: '2',
    label: 'Guest',
    canDestroyAllObjectRecords: false,
    canReadAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    isEditable: true,
    workspaceMembers: [mockWorkspaceMembers[1]],
  },
];

export const getRolesMock = () => {
  return rolesMock;
};
