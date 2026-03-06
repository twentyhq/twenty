import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';
import { sidePanelWorkflowRunIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowRunIdComponentState';
import { sidePanelWorkflowStepIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowStepIdComponentState';
import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { useSetInitialWorkflowRunSidePanelTab } from '@/workflow/workflow-diagram/hooks/useSetInitialWorkflowRunSidePanelTab';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  type IconComponent,
  IconSettingsAutomation,
} from 'twenty-ui/display';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

export const useSidePanelWorkflowNavigation = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { setInitialWorkflowRunSidePanelTab } =
    useSetInitialWorkflowRunSidePanelTab();

  const openWorkflowTriggerTypeInSidePanel = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateSidePanel({
        page: SidePanelPages.WorkflowTriggerSelectType,
        pageTitle: t`Trigger Type`,
        pageIcon: IconBolt,
        pageId,
      });
    },
    [navigateSidePanel, store],
  );

  const openWorkflowCreateStepInSidePanel = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateSidePanel({
        page: SidePanelPages.WorkflowStepCreate,
        pageTitle: t`Select Action`,
        pageIcon: IconSettingsAutomation,
        pageId,
      });
    },
    [navigateSidePanel, store],
  );

  const openWorkflowEditStepInSidePanel = useCallback(
    (
      workflowId: string,
      title: string,
      icon: IconComponent,
      stepId?: string,
    ) => {
      const pageId = v4();

      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      if (isDefined(stepId)) {
        store.set(
          sidePanelWorkflowStepIdComponentState.atomFamily({
            instanceId: pageId,
          }),
          stepId,
        );

        store.set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: workflowId,
          }),
          stepId,
        );
      }

      navigateSidePanel({
        page: SidePanelPages.WorkflowStepEdit,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });
    },
    [navigateSidePanel, store],
  );

  const openWorkflowEditStepTypeInSidePanel = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateSidePanel({
        page: SidePanelPages.WorkflowStepEditType,
        pageTitle: t`Select action`,
        pageIcon: IconSettingsAutomation,
        pageId,
      });
    },
    [navigateSidePanel, store],
  );

  const openWorkflowViewStepInSidePanel = useCallback(
    ({
      workflowId,
      workflowVersionId,
      title,
      icon,
      stepId,
    }: {
      workflowId: string;
      workflowVersionId: string;
      title: string;
      icon: IconComponent;
      stepId?: string;
    }) => {
      const pageId = v4();

      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );
      store.set(
        sidePanelWorkflowVersionIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowVersionId,
      );

      if (isDefined(stepId)) {
        store.set(
          sidePanelWorkflowStepIdComponentState.atomFamily({
            instanceId: pageId,
          }),
          stepId,
        );

        store.set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: workflowVersionId,
          }),
          stepId,
        );
      }

      navigateSidePanel({
        page: SidePanelPages.WorkflowStepView,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });
    },
    [navigateSidePanel, store],
  );

  const openWorkflowRunViewStepInSidePanel = useCallback(
    ({
      workflowId,
      workflowRunId,
      title,
      icon,
      workflowSelectedNode,
      stepExecutionStatus,
    }: {
      workflowId: string;
      workflowRunId: string;
      title: string;
      icon: IconComponent;
      workflowSelectedNode: string;
      stepExecutionStatus: WorkflowRunStepStatus;
    }) => {
      const pageId = v4();

      store.set(
        sidePanelWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );
      store.set(
        sidePanelWorkflowRunIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowRunId,
      );
      store.set(
        sidePanelWorkflowStepIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowSelectedNode,
      );

      store.set(
        workflowSelectedNodeComponentState.atomFamily({
          instanceId: workflowRunId,
        }),
        workflowSelectedNode,
      );

      navigateSidePanel({
        page: SidePanelPages.WorkflowRunStepView,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });

      setInitialWorkflowRunSidePanelTab({
        workflowSelectedNode,
        stepExecutionStatus,
      });
    },
    [navigateSidePanel, setInitialWorkflowRunSidePanelTab, store],
  );

  return {
    openWorkflowTriggerTypeInSidePanel,
    openWorkflowCreateStepInSidePanel,
    openWorkflowEditStepInSidePanel,
    openWorkflowEditStepTypeInSidePanel,
    openWorkflowViewStepInSidePanel,
    openWorkflowRunViewStepInSidePanel,
  };
};
