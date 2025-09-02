import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsRoleAssignmentEntityPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentEntityPickerDropdown';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { t } from '@lingui/core/macro';
import {
  type Agent,
  type Role,
  type WorkspaceMember,
} from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';
import { type RoleMaps } from '../types/role-maps';

export const ROLE_TARGET_CONFIG = {
  member: {
    dropdownId: 'role-member-select',
    getRoleMap: (maps: RoleMaps) => maps.member,
    getName: (entity: CurrentWorkspaceMember) =>
      `${entity.name.firstName} ${entity.name.lastName}`,
    getAssignedIds: (settingsDraftRole: Role) =>
      settingsDraftRole.workspaceMembers.map(
        (member: WorkspaceMember) => member.id,
      ),
    getExcludedIds: (assignedIds: string[], currentMemberId?: string) =>
      currentMemberId ? [...assignedIds, currentMemberId] : assignedIds,
    canBeAssigned: (settingsDraftRole: Role) =>
      settingsDraftRole.canBeAssignedToUsers,
    buttonTitle: () => t`Assign to member`,
    dropdownComponent: SettingsRoleAssignmentWorkspaceMemberPickerDropdown,
  },
  agent: {
    dropdownId: 'role-agent-select',
    getRoleMap: (maps: RoleMaps) => maps.agent,
    getName: (entity: Agent) => entity.label,
    getAssignedIds: (settingsDraftRole: Role) =>
      (settingsDraftRole.agents || []).map((agent: Agent) => agent.id),
    getExcludedIds: (assignedIds: string[]) => assignedIds,
    canBeAssigned: (settingsDraftRole: Role) =>
      settingsDraftRole.canBeAssignedToAgents,
    buttonTitle: () => t`Assign to agent`,
    dropdownComponent: SettingsRoleAssignmentEntityPickerDropdown,
  },
  apiKey: {
    dropdownId: 'role-api-key-select',
    getRoleMap: (maps: RoleMaps) => maps.apiKey,
    getName: (entity: ApiKeyForRole) => entity.name,
    getAssignedIds: (settingsDraftRole: Role) =>
      (settingsDraftRole.apiKeys || []).map(
        (apiKey: ApiKeyForRole) => apiKey.id,
      ),
    getExcludedIds: (assignedIds: string[]) => assignedIds,
    canBeAssigned: (settingsDraftRole: Role) =>
      settingsDraftRole.canBeAssignedToApiKeys,
    buttonTitle: () => t`Assign to API key`,
    dropdownComponent: SettingsRoleAssignmentEntityPickerDropdown,
  },
} as const;
