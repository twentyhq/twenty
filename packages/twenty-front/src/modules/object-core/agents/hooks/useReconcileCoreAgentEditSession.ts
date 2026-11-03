import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { reconcileCoreAgentEditSession } from '@/object-core/agents/utils/reconcileCoreAgentEditSession';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useReconcileCoreAgentEditSession = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const { scopeId, sessionAtom } = useCoreAgentEditScope(agentId);

  const reconcileAgent = useCallback(
    (agent: CoreAgent) => {
      const session = store.get(sessionAtom);
      const roleId = session?.roleId;
      const draftRole = isDefined(roleId)
        ? store.get(settingsDraftRoleFamilyState.getAtom(roleId, scopeId))
        : undefined;
      const baseRole = isDefined(roleId)
        ? (store.get(
            settingsDraftRoleBaseFamilyState.getAtom(roleId, scopeId),
          ) ?? store.get(settingsPersistedRoleFamilyState.atomFamily(roleId)))
        : undefined;
      const hasRoleChanges =
        isDefined(draftRole) &&
        draftRole.id === roleId &&
        (!isDefined(baseRole) ||
          Object.keys(
            getRoleDirtyFields({ draftRole, persistedRole: baseRole }),
          ).length > 0);
      store.set(
        sessionAtom,
        reconcileCoreAgentEditSession({ session, agent, hasRoleChanges }),
      );
    },
    [store, scopeId, sessionAtom],
  );

  return { reconcileAgent };
};
