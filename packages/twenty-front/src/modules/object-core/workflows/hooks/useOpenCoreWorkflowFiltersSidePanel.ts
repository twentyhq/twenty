import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconFilter } from 'twenty-ui/icon';

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';

export const useOpenCoreWorkflowFiltersSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCoreWorkflowFiltersSidePanel = () => {
    navigateSidePanel({
      page: SidePanelPages.WorkflowCoreFilters,
      pageTitle: t`Filter`,
      pageIcon: IconFilter,
      resetNavigationStack: true,
    });
  };

  return { openCoreWorkflowFiltersSidePanel };
};
