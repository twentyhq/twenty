import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { getSelectedCoreAgentIds } from '@/object-core/agents/utils/getSelectedCoreAgentIds';
import { isCoreAgentMatchingFilterSettings } from '@/object-core/agents/utils/isCoreAgentMatchingFilterSettings';
import { type ApolloClient } from '@apollo/client';
import { type createStore } from 'jotai';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

type ReadSelectedCoreAgentIdsArgs = {
  store: ReturnType<typeof createStore>;
  apolloClient: ApolloClient;
  tableId: string;
};

export const readSelectedCoreAgentIds = ({
  store,
  apolloClient,
  tableId,
}: ReadSelectedCoreAgentIdsArgs) => {
  const filterSettings = store.get(coreAgentsFilterSettingsState.atom);
  const coreAgents =
    apolloClient.readQuery({ query: FindManyAgentsDocument })?.findManyAgents ??
    [];
  return getSelectedCoreAgentIds({
    selection: store.get(coreAgentsSelectionFamilyState.getAtom(tableId, null)),
    filterSettings,
    coreAgents: coreAgents.filter((agent) =>
      isCoreAgentMatchingFilterSettings({ agent, filterSettings }),
    ),
    workspaceCustomApplicationId: store.get(currentWorkspaceState.atom)
      ?.workspaceCustomApplication?.id,
  });
};
