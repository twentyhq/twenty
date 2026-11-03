import { settingsRoleSaveSubmissionFamilyState } from '@/settings/roles/states/settingsRoleSaveSubmissionFamilyState';
import { useRefreshCoreAgentEditSession } from '@/object-core/agents/hooks/useRefreshCoreAgentEditSession';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';

export const useDiscardCoreAgentChanges = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const { refreshCoreAgentEditSession } = useRefreshCoreAgentEditSession({
    agentId: sessionAgentId,
  });

  const discardCoreAgentChanges = async () => {
    let session = store.get(sessionAtom);

    if (!isDefined(session) || session.isSaving) {
      return;
    }

    const editedRoleId = session.roleId;

    if (session.requiresRefresh) {
      store.set(sessionAtom, { ...session, isSaving: true });
      try {
        await refreshCoreAgentEditSession();
      } catch (error) {
        const current = store.get(sessionAtom);
        if (isDefined(current)) {
          store.set(sessionAtom, {
            ...current,
            isSaving: false,
            error:
              error instanceof Error
                ? error.message
                : t`Saved changes could not be confirmed. Try again.`,
          });
        }
        return;
      }
      session = store.get(sessionAtom);
      if (!isDefined(session)) {
        return;
      }
    }

    if (isDefined(editedRoleId)) {
      store.set(
        settingsRoleSaveSubmissionFamilyState.getAtom(editedRoleId, scopeId),
        undefined,
      );
    }

    const roleId = session.agent.roleId ?? null;
    const role = isDefined(roleId)
      ? store.get(settingsPersistedRoleFamilyState.atomFamily(roleId))
      : undefined;

    if (isDefined(role)) {
      store.set(
        settingsRoleSaveSubmissionFamilyState.getAtom(role.id, scopeId),
        undefined,
      );
      store.set(settingsDraftRoleFamilyState.getAtom(role.id, scopeId), role);
      store.set(
        settingsDraftRoleBaseFamilyState.getAtom(role.id, scopeId),
        role,
      );
    }

    store.set(sessionAtom, {
      ...session,
      draft: session.confirmed,
      scheduleDrafts: undefined,
      roleId,
      isSaving: false,
      requiresRefresh: false,
      submission: null,
      error: null,
      resetVersion: session.resetVersion + 1,
    });
  };

  return { discardCoreAgentChanges };
};
