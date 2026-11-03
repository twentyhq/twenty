import { CORE_AGENT_DETAIL_VIEW_QUERY_KEY } from '@/object-core/agents/constants/CoreAgentDetailViewQueryKey';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { coreAgentsSelectionOwnerCountFamilyState } from '@/object-core/agents/states/coreAgentsSelectionOwnerCountFamilyState';
import { AppPath } from 'twenty-shared/types';
import { logError } from '~/utils/logError';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useContext } from 'react';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { useOpenCoreAgentDeleteDialog } from '@/object-core/agents/hooks/useOpenCoreAgentDeleteDialog';
import { useOpenCoreAgentFiltersSidePanel } from '@/object-core/agents/hooks/useOpenCoreAgentFiltersSidePanel';
import { useOpenCoreAgentsDeleteDialog } from '@/object-core/agents/hooks/useOpenCoreAgentsDeleteDialog';
import { useSaveCoreAgentChanges } from '@/object-core/agents/hooks/useSaveCoreAgentChanges';
import { useSetCoreAgentDetailView } from '@/object-core/agents/hooks/useSetCoreAgentDetailView';
import { coreAgentCreationPendingFamilyState } from '@/object-core/agents/states/coreAgentCreationPendingFamilyState';
import { coreAgentDetailViewFamilyState } from '@/object-core/agents/states/coreAgentDetailViewFamilyState';
import { coreAgentsIsDeletingFamilyState } from '@/object-core/agents/states/coreAgentsIsDeletingFamilyState';
import { readCoreAgentEditStatus } from '@/object-core/agents/utils/readCoreAgentEditStatus';
import { readSelectedCoreAgentIds } from '@/object-core/agents/utils/readSelectedCoreAgentIds';
import { type CoreAgentCommandId } from '@/object-core/commands/types/CoreAgentCommandId';
import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
import { getCoreAgentCommandAvailability } from '@/object-core/commands/utils/getCoreAgentCommandAvailability';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { getAppPath, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type UseExecuteCoreAgentCommandArgs = {
  origin: CoreAgentCommandOrigin | null;
  pageId: string;
};

export const useExecuteCoreAgentCommand = ({
  origin,
  pageId,
}: UseExecuteCoreAgentCommandArgs) => {
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const store = useStore();
  const apolloClient = useApolloClient();
  const agentId = origin?.target.type === 'record' ? origin.target.agentId : '';
  const tableId = origin?.target.type === 'index' ? origin.target.tableId : '';
  const { createCoreAgent } = useCreateCoreAgent({ navigateOnCreate: false });
  const { saveCoreAgentChanges } = useSaveCoreAgentChanges({ agentId });
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges({ agentId });
  const { setCoreAgentDetailView } = useSetCoreAgentDetailView({ agentId });
  const { openCoreAgentDeleteDialog } = useOpenCoreAgentDeleteDialog({
    agentId,
  });
  const { openCoreAgentsDeleteDialog } = useOpenCoreAgentsDeleteDialog(tableId);
  const { openCoreAgentFiltersSidePanel } = useOpenCoreAgentFiltersSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { goBackFromSidePanel } = useSidePanelHistory();
  const executeCoreAgentCommand = (commandId: CoreAgentCommandId) => {
    const workspace = store.get(currentWorkspaceState.atom);
    const user = store.get(currentUserState.atom);
    const stack = store.get(sidePanelNavigationStackState.atom);
    if (
      !store.get(isSidePanelOpenedState.atom) ||
      !isDefined(origin) ||
      !isDefined(workspace) ||
      !isDefined(user) ||
      origin.workspaceId !== workspace.id ||
      origin.userId !== user.id ||
      stack.at(-1)?.pageId !== pageId
    ) {
      return;
    }
    const permissionFlags = store.get(permissionFlagMapSelector.atom);
    const scopeId = origin.scopeId;
    const selectedAgentIds = readSelectedCoreAgentIds({
      store,
      apolloClient,
      tableId,
    });
    const availability = getCoreAgentCommandAvailability({
      target: origin.target,
      canManageAgents: permissionFlags[PermissionFlagType.AI_SETTINGS],
      isInPreviewMode,
      isCreating: store.get(
        coreAgentCreationPendingFamilyState.getAtom(
          `${workspace.id}:${user.id}`,
          null,
        ),
      ),
      selectedCount: selectedAgentIds.length,
      isDeleting: store.get(
        coreAgentsIsDeletingFamilyState.getAtom(tableId, null),
      ),
      record: readCoreAgentEditStatus({ store, agentId, scopeId }),
      view: store.get(coreAgentDetailViewFamilyState.getAtom(agentId, scopeId)),
      canShowRuns:
        workspace.featureFlags?.some(
          ({ key, value }) =>
            key === FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED && value,
        ) ?? false,
    })[commandId];
    if (!availability.visible || availability.disabled) {
      return;
    }
    const hasOriginPage =
      origin.surfaceType === 'side-panel' &&
      stack.at(-2)?.routedFlowStateScopeId === scopeId;
    const returnToOrigin = () => {
      if (hasOriginPage) {
        goBackFromSidePanel();
        return;
      }
      void closeSidePanelMenu();
    };
    switch (commandId) {
      case 'create': {
        const sourcePageId = stack.at(-2)?.pageId;
        void createCoreAgent()
          .then((createdAgentId) => {
            const hasCurrentActor =
              store.get(currentWorkspaceState.atom)?.id ===
                origin.workspaceId &&
              store.get(currentUserState.atom)?.id === origin.userId;
            const currentPage = store
              .get(sidePanelNavigationStackState.atom)
              .at(-1);
            const hasCurrentSource =
              origin.surfaceType === 'main'
                ? store.get(
                    coreAgentsSelectionOwnerCountFamilyState.getAtom(
                      tableId,
                      null,
                    ),
                  ) > 0
                : currentPage?.pageId === sourcePageId &&
                  currentPage?.routedFlowStateScopeId === scopeId;
            if (
              !isDefined(createdAgentId) ||
              !hasCurrentActor ||
              !hasCurrentSource
            ) {
              return;
            }
            origin.navigator?.push(
              getAppPath(AppPath.AgentShowPage, { agentId: createdAgentId }),
            );
          })
          .catch(logError);
        returnToOrigin();
        return;
      }
      case 'filter':
        if (hasOriginPage) {
          goBackFromSidePanel();
        }
        openCoreAgentFiltersSidePanel({
          resetNavigationStack: !hasOriginPage,
          routedFlowStateScopeId: scopeId,
        });
        return;
      case 'selection-runs': {
        const [selectedAgentId] = selectedAgentIds;
        if (
          !isNonEmptyArray(selectedAgentIds) ||
          !isDefined(selectedAgentId) ||
          !isDefined(origin.navigator)
        ) {
          return;
        }
        returnToOrigin();
        origin.navigator.push(
          getAppPath(
            AppPath.AgentShowPage,
            { agentId: selectedAgentId },
            { [CORE_AGENT_DETAIL_VIEW_QUERY_KEY]: 'runs' },
          ),
        );
        return;
      }
      case 'delete-selection':
        openCoreAgentsDeleteDialog();
        returnToOrigin();
        return;
      case 'save':
        void saveCoreAgentChanges();
        returnToOrigin();
        return;
      case 'cancel':
        void discardCoreAgentChanges();
        returnToOrigin();
        return;
      case 'delete':
        openCoreAgentDeleteDialog();
        returnToOrigin();
        return;
      case 'runs':
        setCoreAgentDetailView('runs');
        returnToOrigin();
        return;
      case 'settings':
        setCoreAgentDetailView('settings');
        returnToOrigin();
        return;
    }
  };
  return { executeCoreAgentCommand };
};
