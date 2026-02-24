import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const settingsDraftRoleFamilyState = createFamilyStateV2<
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
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    canBeAssignedToUsers: false,
    agents: [],
    apiKeys: [],
  },
});
