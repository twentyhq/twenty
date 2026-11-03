import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { coreAgentDetailViewFamilyState } from '@/object-core/agents/states/coreAgentDetailViewFamilyState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useSetCoreAgentDetailView = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const setCoreAgentDetailView = (view: 'settings' | 'runs') => {
    if (!isDefined(store.get(sessionAtom))) {
      return;
    }
    const canShowRuns = store
      .get(currentWorkspaceState.atom)
      ?.featureFlags?.some(
        ({ key, value }) =>
          key === FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED && value,
      );
    const canReadAgentRuns = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.AI_SETTINGS
    ];
    if (view === 'runs' && (!canShowRuns || !canReadAgentRuns)) {
      return;
    }
    store.set(
      coreAgentDetailViewFamilyState.getAtom(sessionAgentId, scopeId),
      view,
    );
  };
  return { setCoreAgentDetailView };
};
