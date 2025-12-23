import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsRoleAssignmentEntityPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentEntityPickerDropdown';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { t } from '@lingui/core/macro';
import { type Agent } from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';
import {
  type PartialWorkspaceMember,
  type RoleWithPartialMembers,
} from '@/settings/roles/types/RoleWithPartialMembers';
import { type RoleMaps } from '@/settings/roles/role-assignment/types/role-maps';

export const ROLE_TARGET_CONFIG = {
  member: {
    dropdownId: 'role-member-select',
    getRoleMap: (maps: RoleMaps) => maps.member,
    getName: (entity: CurrentWorkspaceMember) =>
      `${entity.name.firstName} ${entity.name.lastName}`,
    getAssignedIds: (settingsDraftRole: RoleWithPartialMembers) =>
      settingsDraftRole.workspaceMembers.map(
        (member: PartialWorkspaceMember) => member.id,
      ),
    getExcludedIds: (assignedIds: string[], currentMemberId?: string) =>
      currentMemberId ? [...assignedIds, currentMemberId] : assignedIds,
    canBeAssigned: (settingsDraftRole: RoleWithPartialMembers) =>
      settingsDraftRole.canBeAssignedToUsers,
    buttonTitle: () => t`Assign to member`,
    dropdownComponent: SettingsRoleAssignmentWorkspaceMemberPickerDropdown,
    // Tooltip configuration for member type
    tooltip: {
      anchorId: 'assign-member',
      content: () => t`All workspace members already have this role`,
      shouldShow: (allWorkspaceMembersHaveThisRole?: boolean) =>
        allWorkspaceMembersHaveThisRole ?? false,
    },
  },
  agent: {
    dropdownId: 'role-agent-select',
    getRoleMap: (maps: RoleMaps) => maps.agent,
    getName: (entity: Agent) => entity.label,
    getAssignedIds: (settingsDraftRole: RoleWithPartialMembers) =>
      (settingsDraftRole.agents || []).map((agent: Agent) => agent.id),
    getExcludedIds: (assignedIds: string[]) => assignedIds,
    canBeAssigned: (settingsDraftRole: RoleWithPartialMembers) =>
      settingsDraftRole.canBeAssignedToAgents,
    buttonTitle: () => t`Assign to agent`,
    dropdownComponent: SettingsRoleAssignmentEntityPickerDropdown,
    // No tooltip for agent type
    tooltip: null,
  },
  apiKey: {
    dropdownId: 'role-api-key-select',
    getRoleMap: (maps: RoleMaps) => maps.apiKey,
    getName: (entity: ApiKeyForRole) => entity.name,
    getAssignedIds: (settingsDraftRole: RoleWithPartialMembers) =>
      (settingsDraftRole.apiKeys || []).map(
        (apiKey: ApiKeyForRole) => apiKey.id,
      ),
    getExcludedIds: (assignedIds: string[]) => assignedIds,
    canBeAssigned: (settingsDraftRole: RoleWithPartialMembers) =>
      settingsDraftRole.canBeAssignedToApiKeys,
    buttonTitle: () => t`Assign to API key`,
    dropdownComponent: SettingsRoleAssignmentEntityPickerDropdown,
    // No tooltip for apiKey type
    tooltip: null,
  },
} as const;
