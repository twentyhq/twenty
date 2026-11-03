import { coreAgentTriggerTargetComponentState } from '@/object-core/agents/states/coreAgentTriggerTargetComponentState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { IconBolt } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenCoreAgentTrigger = () => {
  const store = useStore();
  const scopeId = useRoutedFlowStateScopeId();
  const workspaceSurface = useWorkspaceSurface();
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCoreAgentTrigger = ({
    agentId,
    triggerId,
  }: {
    agentId: string;
    triggerId: string;
  }) => {
    const pageId = v4();
    store.set(
      coreAgentTriggerTargetComponentState.atomFamily({ instanceId: pageId }),
      { agentId, triggerId, scopeId },
    );
    navigateSidePanel({
      pageId,
      page: SidePanelPages.AgentCoreTrigger,
      pageTitle: t`Trigger`,
      pageIcon: IconBolt,
      routedFlowStateScopeId: scopeId ?? undefined,
      resetNavigationStack: workspaceSurface.type === 'main',
    });
  };

  return { openCoreAgentTrigger };
};
