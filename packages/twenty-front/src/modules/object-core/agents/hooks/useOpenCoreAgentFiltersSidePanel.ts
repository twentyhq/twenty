import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconFilter } from 'twenty-ui/icon';

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';

export const useOpenCoreAgentFiltersSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCoreAgentFiltersSidePanel = () => {
    navigateSidePanel({
      page: SidePanelPages.AgentCoreFilters,
      pageTitle: t`Filter`,
      pageIcon: IconFilter,
      resetNavigationStack: true,
    });
  };

  return { openCoreAgentFiltersSidePanel };
};
