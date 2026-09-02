import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';
import { sidePanelWorkflowRunIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowRunIdComponentState';
import { sidePanelWorkflowStepIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowStepIdComponentState';
import { sidePanelWorkflowVisualizerComponentInstanceIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVisualizerComponentInstanceIdComponentState';
import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceIdResolver } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useSetInitialWorkflowRunSidePanelTab } from '@/workflow/workflow-diagram/hooks/useSetInitialWorkflowRunSidePanelTab';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  type IconComponent,
  IconSettingsAutomation,
} from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

export const useSidePanelWorkflowNavigation = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { setInitialWorkflowRunSidePanelTab } =
    useSetInitialWorkflowRunSidePanelTab();
  const inheritedWorkflowVisualizerComponentInstanceId =
    useAvailableComponentInstanceId(WorkflowVisualizerComponentInstanceContext);
  const resolveWorkspaceSurfaceScopedComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceIdResolver();

  const setWorkflowVisualizerComponentInstanceIdForSidePanelPage = useCallback(
    ({ pageId, recordId }: { pageId: string; recordId: string }) => {
      const workflowVisualizerComponentInstanceId =
        inheritedWorkflowVisualizerComponentInstanceId ??
        resolveWorkspaceSurfaceScopedComponentInstanceId(
          getWorkflowVisualizerComponentInstanceId({ recordId }),
        );

      store.set(
        sidePanelWorkflowVisualizerComponentInstanceIdComponentState.atomFamily(
          { instanceId: pageId },
        ),
        workflowVisualizerComponentInstanceId,
      );

      return workflowVisualizerComponentInstanceId;
    },
    [
      inheritedWorkflowVisualizerComponentInstanceId,
      resolveWorkspaceSurfaceScopedComponentInstanceId,
      store,
    ],
  );

  const openWorkflowTriggerTypeInSidePanel = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      setWorkflowVisualizerComponentInstanceIdForSidePanelPage({
        pageId,
        recordId: workflowId,
      });

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
    [
      navigateSidePanel,
      setWorkflowVisualizerComponentInstanceIdForSidePanelPage,
      store,
    ],
  );

  const openWorkflowCreateStepInSidePanel = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      setWorkflowVisualizerComponentInstanceIdForSidePanelPage({
        pageId,
        recordId: workflowId,
      });

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
    [
      navigateSidePanel,
      setWorkflowVisualizerComponentInstanceIdForSidePanelPage,
      store,
    ],
  );

  const openWorkflowEditStepInSidePanel = useCallback(
    (
      workflowId: string,
      title: string,
      icon: IconComponent,
      stepId?: string,
    ) => {
      const pageId = v4();

      const workflowVisualizerComponentInstanceId =
        setWorkflowVisualizerComponentInstanceIdForSidePanelPage({
          pageId,
          recordId: workflowId,
        });

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
            instanceId: workflowVisualizerComponentInstanceId,
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
    [
      navigateSidePanel,
      setWorkflowVisualizerComponentInstanceIdForSidePanelPage,
      store,
    ],
  );

  const openWorkflowEditStepTypeInSidePanel = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      setWorkflowVisualizerComponentInstanceIdForSidePanelPage({
        pageId,
        recordId: workflowId,
      });

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
    [
      navigateSidePanel,
      setWorkflowVisualizerComponentInstanceIdForSidePanelPage,
      store,
    ],
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

      const workflowVisualizerComponentInstanceId =
        setWorkflowVisualizerComponentInstanceIdForSidePanelPage({
          pageId,
          recordId: workflowVersionId,
        });

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
            instanceId: workflowVisualizerComponentInstanceId,
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
    [
      navigateSidePanel,
      setWorkflowVisualizerComponentInstanceIdForSidePanelPage,
      store,
    ],
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

      const workflowVisualizerComponentInstanceId =
        setWorkflowVisualizerComponentInstanceIdForSidePanelPage({
          pageId,
          recordId: workflowRunId,
        });

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
          instanceId: workflowVisualizerComponentInstanceId,
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
    [
      navigateSidePanel,
      setInitialWorkflowRunSidePanelTab,
      setWorkflowVisualizerComponentInstanceIdForSidePanelPage,
      store,
    ],
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
