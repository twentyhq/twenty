import { useStore } from 'jotai';
import { type IconComponent } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { coreAgentSidePanelAgentIdComponentState } from '@/object-core/agents/states/coreAgentSidePanelAgentIdComponentState';
import { coreAgentSidePanelTriggerIdComponentState } from '@/object-core/agents/states/coreAgentSidePanelTriggerIdComponentState';
import { type CoreAgentSidePanelPage } from '@/object-core/agents/types/CoreAgentSidePanelPage';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

export const useOpenCoreAgentSidePanelPage = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openCoreAgentSidePanelPage = ({
    agentId,
    triggerId = null,
    page,
    pageTitle,
    pageIcon,
  }: {
    agentId: string;
    triggerId?: string | null;
    page: CoreAgentSidePanelPage;
    pageTitle: string;
    pageIcon: IconComponent;
  }) => {
    const pageId = v4();

    store.set(
      coreAgentSidePanelAgentIdComponentState.atomFamily({
        instanceId: pageId,
      }),
      agentId,
    );
    store.set(
      coreAgentSidePanelTriggerIdComponentState.atomFamily({
        instanceId: pageId,
      }),
      triggerId,
    );

    navigateSidePanelMenu({
      page,
      pageTitle,
      pageIcon,
      pageId,
      resetNavigationStack: true,
    });
  };

  return { openCoreAgentSidePanelPage };
};
