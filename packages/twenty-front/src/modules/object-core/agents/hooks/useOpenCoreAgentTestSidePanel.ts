import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconPlayerPlay } from 'twenty-ui/icon';

import { useOpenCoreAgentSidePanelPage } from '@/object-core/agents/hooks/useOpenCoreAgentSidePanelPage';

export const useOpenCoreAgentTestSidePanel = () => {
  const { t } = useLingui();
  const { openCoreAgentSidePanelPage } = useOpenCoreAgentSidePanelPage();

  const openCoreAgentTestSidePanel = (agentId: string) =>
    openCoreAgentSidePanelPage({
      agentId,
      page: SidePanelPages.AgentCoreTest,
      pageTitle: t`Test agent`,
      pageIcon: IconPlayerPlay,
    });

  return { openCoreAgentTestSidePanel };
};
