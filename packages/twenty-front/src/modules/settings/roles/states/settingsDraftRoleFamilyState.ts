import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const settingsDraftRoleFamilyState = createFamilyState<
  RoleWithPartialMembers,
  string
>({
  key: 'settingsDraftRoleFamilyState',
  defaultValue: {
    __typename: 'Role',
    id: '',
    label: '',
    description: '',
    icon: '',
    canDestroyAllObjectRecords: false,
    canReadAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    isEditable: false,
    workspaceMembers: [],
    permissionFlags: [],
    objectPermissions: [],
    fieldPermissions: [],
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    canBeAssignedToUsers: false,
    agents: [],
    apiKeys: [],
  },
});
