import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentEditSessionFamilyState } from '@/object-core/agents/states/coreAgentEditSessionFamilyState';
import { getCoreAgentEditStatus } from '@/object-core/agents/utils/getCoreAgentEditStatus';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type createStore } from 'jotai';

type ReadCoreAgentEditStatusArgs = {
  store: ReturnType<typeof createStore>;
  agentId: string;
  scopeId: string | null;
};

export const readCoreAgentEditStatus = ({
  store,
  agentId,
  scopeId,
}: ReadCoreAgentEditStatusArgs) => {
  const session = store.get(
    coreAgentEditSessionFamilyState.getAtom(agentId, scopeId),
  );
  const roleId = session?.roleId ?? '';
  return getCoreAgentEditStatus({
    agentId,
    session,
    draftRole: store.get(settingsDraftRoleFamilyState.getAtom(roleId, scopeId)),
    roleBase: store.get(
      settingsDraftRoleBaseFamilyState.getAtom(roleId, scopeId),
    ),
    persistedRole: store.get(
      settingsPersistedRoleFamilyState.getAtom(roleId, null),
    ),
    permissionFlags: store.get(permissionFlagMapSelector.atom),
    workspaceCustomApplicationId: store.get(currentWorkspaceState.atom)
      ?.workspaceCustomApplication?.id,
  });
};
