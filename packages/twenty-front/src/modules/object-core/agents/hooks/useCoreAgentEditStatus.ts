import { getCoreAgentEditStatus } from '@/object-core/agents/utils/getCoreAgentEditStatus';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomValue } from 'jotai';

export const useCoreAgentEditStatus = ({
  agentId,
}: { agentId?: string } = {}) => {
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const session = useAtomValue(sessionAtom);
  const roleId = session?.roleId ?? '';
  const draftRole = useAtomValue(
    settingsDraftRoleFamilyState.getAtom(roleId, scopeId),
  );
  const roleBase = useAtomValue(
    settingsDraftRoleBaseFamilyState.getAtom(roleId, scopeId),
  );
  const persistedRole = useAtomValue(
    settingsPersistedRoleFamilyState.atomFamily(roleId),
  );
  const workspace = useAtomValue(currentWorkspaceState.atom);
  const permissionFlags = useAtomValue(permissionFlagMapSelector.atom);
  return getCoreAgentEditStatus({
    agentId: sessionAgentId,
    session,
    draftRole,
    roleBase,
    persistedRole,
    permissionFlags,
    workspaceCustomApplicationId: workspace?.workspaceCustomApplication?.id,
  });
};
