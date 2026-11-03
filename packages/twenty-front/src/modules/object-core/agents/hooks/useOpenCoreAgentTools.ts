import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { usePrepareCoreAgentRole } from '@/object-core/agents/hooks/usePrepareCoreAgentRole';
import { coreAgentPermissionsTargetComponentState } from '@/object-core/agents/states/coreAgentPermissionsTargetComponentState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconTool } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenCoreAgentTools = ({
  agentId,
}: { agentId?: string } = {}) => {
  const { t } = useLingui();
  const store = useStore();
  const workspaceSurface = useWorkspaceSurface();
  const { sessionAtom, scopeId } = useCoreAgentEditScope(agentId);
  const { prepareCoreAgentRole } = usePrepareCoreAgentRole({ agentId });
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCoreAgentTools = () => {
    const session = store.get(sessionAtom);

    if (!isDefined(session)) {
      return;
    }

    prepareCoreAgentRole();
    const pageId = v4();
    store.set(
      coreAgentPermissionsTargetComponentState.atomFamily({
        instanceId: pageId,
      }),
      { agentId: session.agent.id, scopeId },
    );
    navigateSidePanel({
      pageId,
      page: SidePanelPages.AgentCoreTools,
      pageTitle: t`Tools`,
      pageIcon: IconTool,
      routedFlowStateScopeId: scopeId ?? undefined,
      resetNavigationStack: workspaceSurface.type === 'main',
    });
  };

  return { openCoreAgentTools };
};
