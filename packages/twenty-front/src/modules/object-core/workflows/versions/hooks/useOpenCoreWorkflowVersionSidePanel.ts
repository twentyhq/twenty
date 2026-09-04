import { useStore } from 'jotai';
import { v4 } from 'uuid';

import { SidePanelPages } from 'twenty-shared/types';
import { IconVersions } from 'twenty-ui/icon';

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';

export const useOpenCoreWorkflowVersionSidePanel = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCoreWorkflowVersionSidePanel = ({
    workspaceWorkflowVersionId,
    pageTitle,
  }: {
    workspaceWorkflowVersionId: string;
    pageTitle: string;
  }) => {
    const pageId = v4();

    store.set(
      sidePanelWorkflowVersionIdComponentState.atomFamily({
        instanceId: pageId,
      }),
      workspaceWorkflowVersionId,
    );

    navigateSidePanel({
      page: SidePanelPages.WorkflowVersion,
      pageTitle,
      pageIcon: IconVersions,
      pageId,
    });
  };

  return { openCoreWorkflowVersionSidePanel };
};
