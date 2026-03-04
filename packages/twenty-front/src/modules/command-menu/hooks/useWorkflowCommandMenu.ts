import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { commandMenuWorkflowRunIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowRunIdComponentState';
import { commandMenuWorkflowStepIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowStepIdComponentState';
import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
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

export const useWorkflowCommandMenu = () => {
  const store = useStore();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { setInitialWorkflowRunSidePanelTab } =
    useSetInitialWorkflowRunSidePanelTab();

  const openWorkflowTriggerTypeInCommandMenu = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      store.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateCommandMenu({
        page: SidePanelPages.WorkflowTriggerSelectType,
        pageTitle: t`Trigger Type`,
        pageIcon: IconBolt,
        pageId,
      });
    },
    [navigateCommandMenu, store],
  );

  const openWorkflowCreateStepInCommandMenu = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      store.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateCommandMenu({
        page: SidePanelPages.WorkflowStepCreate,
        pageTitle: t`Select Action`,
        pageIcon: IconSettingsAutomation,
        pageId,
      });
    },
    [navigateCommandMenu, store],
  );

  const openWorkflowEditStepInCommandMenu = useCallback(
    (
      workflowId: string,
      title: string,
      icon: IconComponent,
      stepId?: string,
    ) => {
      const pageId = v4();

      store.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      if (isDefined(stepId)) {
        store.set(
          commandMenuWorkflowStepIdComponentState.atomFamily({
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

      navigateCommandMenu({
        page: SidePanelPages.WorkflowStepEdit,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });
    },
    [navigateCommandMenu, store],
  );

  const openWorkflowEditStepTypeInCommandMenu = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      store.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateCommandMenu({
        page: SidePanelPages.WorkflowStepEditType,
        pageTitle: t`Select action`,
        pageIcon: IconSettingsAutomation,
        pageId,
      });
    },
    [navigateCommandMenu, store],
  );

  const openWorkflowViewStepInCommandMenu = useCallback(
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
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );
      store.set(
        commandMenuWorkflowVersionIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowVersionId,
      );

      if (isDefined(stepId)) {
        store.set(
          commandMenuWorkflowStepIdComponentState.atomFamily({
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

      navigateCommandMenu({
        page: SidePanelPages.WorkflowStepView,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });
    },
    [navigateCommandMenu, store],
  );

  const openWorkflowRunViewStepInCommandMenu = useCallback(
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
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );
      store.set(
        commandMenuWorkflowRunIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowRunId,
      );
      store.set(
        commandMenuWorkflowStepIdComponentState.atomFamily({
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

      navigateCommandMenu({
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
    [navigateCommandMenu, setInitialWorkflowRunSidePanelTab, store],
  );

  return {
    openWorkflowTriggerTypeInCommandMenu,
    openWorkflowCreateStepInCommandMenu,
    openWorkflowEditStepInCommandMenu,
    openWorkflowEditStepTypeInCommandMenu,
    openWorkflowViewStepInCommandMenu,
    openWorkflowRunViewStepInCommandMenu,
  };
};
