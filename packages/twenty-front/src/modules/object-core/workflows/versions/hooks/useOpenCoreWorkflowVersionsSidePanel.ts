import { useStore } from 'jotai';
import { v4 } from 'uuid';

import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconVersions } from 'twenty-ui/icon';

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';

export const useOpenCoreWorkflowVersionsSidePanel = () => {
  const { t } = useLingui();
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCoreWorkflowVersionsSidePanel = (workflowId: string) => {
    const pageId = v4();

    store.set(
      sidePanelWorkflowIdComponentState.atomFamily({ instanceId: pageId }),
      workflowId,
    );

    navigateSidePanel({
      page: SidePanelPages.WorkflowVersions,
      pageTitle: t`Workflow versions`,
      pageIcon: IconVersions,
      pageId,
      resetNavigationStack: true,
    });
  };

  return { openCoreWorkflowVersionsSidePanel };
};
