import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CORE_AGENT_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentStoryAgent';
import { coreAgentEditSessionFamilyState } from '@/object-core/agents/states/coreAgentEditSessionFamilyState';
import { reconcileCoreAgentEditSession } from '@/object-core/agents/utils/reconcileCoreAgentEditSession';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPermissionFlagDefinitionsState } from '@/settings/roles/states/settingsPermissionFlagDefinitionsState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { createStore } from 'jotai';
import {
  PermissionFlagType,
  type GetRolesQuery,
  type RolePermissionFlag,
} from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const ROLE_ID = '00000000-0000-4000-8000-000000000003';

type CoreAgentPermissionsStoryStoreOptions = {
  mode?: 'exclusive' | 'shared' | 'read-only' | 'loading' | 'no-role';
  canAccessAllTools?: boolean;
  permissionKeys?: string[];
  permissionDefinitions?: GetRolesQuery['getPermissionFlags'];
};

export const createCoreAgentPermissionsStoryStore = ({
  mode = 'exclusive',
  canAccessAllTools = false,
  permissionKeys = [],
  permissionDefinitions = [],
}: CoreAgentPermissionsStoryStoreOptions = {}) => {
  const store = createStore();
  const agent = {
    ...CORE_AGENT_STORY_AGENT,
    roleId: mode === 'no-role' ? null : ROLE_ID,
    applicationId: mockCurrentWorkspace.workspaceCustomApplication.id,
  };
  const role = {
    ...DEFAULT_SETTINGS_DRAFT_ROLE,
    id: ROLE_ID,
    universalIdentifier: null,
    label: 'Researcher role',
    applicationId: agent.applicationId,
    isEditable: true,
    canBeAssignedToAgents: true,
    canBeAssignedToUsers: false,
    canAccessAllTools,
    agents:
      mode === 'shared' ? [agent, { ...agent, id: 'other-agent' }] : [agent],
    permissionFlags: permissionKeys.map<RolePermissionFlag>((flag, index) => ({
      __typename: 'RolePermissionFlag',
      id: `permission-${index}`,
      roleId: ROLE_ID,
      flag,
    })),
  };
  store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags:
      mode === 'read-only'
        ? []
        : [PermissionFlagType.AI_SETTINGS, PermissionFlagType.ROLES],
  });
  store.set(settingsRolesIsLoadingState.atom, mode === 'loading');
  store.set(settingsPermissionFlagDefinitionsState.atom, permissionDefinitions);
  store.set(
    coreAgentEditSessionFamilyState.atomFamily(agent.id),
    reconcileCoreAgentEditSession({
      session: undefined,
      agent,
      hasRoleChanges: false,
    }),
  );
  store.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), role);
  store.set(settingsDraftRoleBaseFamilyState.atomFamily(ROLE_ID), role);
  store.set(
    settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
    mode === 'loading' ? undefined : role,
  );
  return { store, agent, role, permissionDefinitions };
};
