import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CORE_AGENT_DETAIL_VIEW_QUERY_KEY } from '@/object-core/agents/constants/CoreAgentDetailViewQueryKey';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { coreAgentDetailViewFamilyState } from '@/object-core/agents/states/coreAgentDetailViewFamilyState';
import { coreAgentDetailViewLocationKeyFamilyState } from '@/object-core/agents/states/coreAgentDetailViewLocationKeyFamilyState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomValue, useStore } from 'jotai';
import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const CoreAgentDetailViewInitializationEffect = ({
  agentId,
}: {
  agentId: string;
}) => {
  const store = useStore();
  const { scopeId, sessionAtom } = useCoreAgentEditScope(agentId);
  const session = useAtomValue(sessionAtom);
  const { key: locationKey } = useLocation();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get(CORE_AGENT_DETAIL_VIEW_QUERY_KEY);
  const appliedLocationAtom = coreAgentDetailViewLocationKeyFamilyState.getAtom(
    agentId,
    scopeId,
  );
  const viewAtom = coreAgentDetailViewFamilyState.getAtom(agentId, scopeId);
  useEffect(() => {
    if (!isDefined(session) || store.get(appliedLocationAtom) === locationKey) {
      return;
    }
    store.set(appliedLocationAtom, locationKey);
    const canShowRuns = store
      .get(currentWorkspaceState.atom)
      ?.featureFlags?.some(
        ({ key, value }) =>
          key === FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED && value,
      );
    const canReadAgentRuns = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.AI_SETTINGS
    ];
    if (requestedView === 'runs' && canShowRuns && canReadAgentRuns) {
      store.set(viewAtom, 'runs');
    }
  }, [
    appliedLocationAtom,
    locationKey,
    requestedView,
    session,
    store,
    viewAtom,
  ]);
  return null;
};
