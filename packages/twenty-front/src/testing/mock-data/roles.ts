import { PermissionFlagType, type Role } from '~/generated/graphql';
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
    canAccessAllTools: true,
    isEditable: false,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: true,
    agents: [],
    apiKeys: [],
    workspaceMembers: [mockWorkspaceMembers[0]],
    permissionFlags: [
      {
        __typename: 'PermissionFlag',
        id: '94257a55-3211-489c-92d3-9e68061da400',
        flag: PermissionFlagType.WORKSPACE_MEMBERS,
        roleId: '1',
      },
    ],
    objectPermissions: [
      {
        __typename: 'ObjectPermission',
        objectMetadataId: 'fac890af-68c5-4718-a16b-7401b1868429',
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
      },
    ],
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
    canAccessAllTools: false,
    isEditable: true,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: true,
    agents: [],
    apiKeys: [],
    workspaceMembers: [mockWorkspaceMembers[1]],
    permissionFlags: [],
    objectPermissions: [
      {
        __typename: 'ObjectPermission',
        objectMetadataId: 'fac890af-68c5-4718-a16b-7401b1868429',
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ],
  },
];

export const getRolesMock = () => {
  return rolesMock;
};
