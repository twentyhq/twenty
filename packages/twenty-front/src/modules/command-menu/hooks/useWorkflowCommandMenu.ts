import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { commandMenuWorkflowRunIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowRunIdComponentState';
import { commandMenuWorkflowStepIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowStepIdComponentState';
import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { useSetInitialWorkflowRunRightDrawerTab } from '@/workflow/workflow-diagram/hooks/useSetInitialWorkflowRunRightDrawerTab';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  type IconComponent,
  IconSettingsAutomation,
} from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useWorkflowCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { setInitialWorkflowRunRightDrawerTab } =
    useSetInitialWorkflowRunRightDrawerTab();

  const openWorkflowTriggerTypeInCommandMenu = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      jotaiStore.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateCommandMenu({
        page: CommandMenuPages.WorkflowTriggerSelectType,
        pageTitle: t`Trigger Type`,
        pageIcon: IconBolt,
        pageId,
      });
    },
    [navigateCommandMenu],
  );

  const openWorkflowCreateStepInCommandMenu = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      jotaiStore.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateCommandMenu({
        page: CommandMenuPages.WorkflowStepCreate,
        pageTitle: t`Select Action`,
        pageIcon: IconSettingsAutomation,
        pageId,
      });
    },
    [navigateCommandMenu],
  );

  const openWorkflowEditStepInCommandMenu = useCallback(
    (
      workflowId: string,
      title: string,
      icon: IconComponent,
      stepId?: string,
    ) => {
      const pageId = v4();

      jotaiStore.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      if (isDefined(stepId)) {
        jotaiStore.set(
          commandMenuWorkflowStepIdComponentState.atomFamily({
            instanceId: pageId,
          }),
          stepId,
        );

        jotaiStore.set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: workflowId,
          }),
          stepId,
        );
      }

      navigateCommandMenu({
        page: CommandMenuPages.WorkflowStepEdit,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });
    },
    [navigateCommandMenu],
  );

  const openWorkflowEditStepTypeInCommandMenu = useCallback(
    (workflowId: string) => {
      const pageId = v4();

      jotaiStore.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );

      navigateCommandMenu({
        page: CommandMenuPages.WorkflowStepEditType,
        pageTitle: t`Select action`,
        pageIcon: IconSettingsAutomation,
        pageId,
      });
    },
    [navigateCommandMenu],
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

      jotaiStore.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );
      jotaiStore.set(
        commandMenuWorkflowVersionIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowVersionId,
      );

      if (isDefined(stepId)) {
        jotaiStore.set(
          commandMenuWorkflowStepIdComponentState.atomFamily({
            instanceId: pageId,
          }),
          stepId,
        );

        jotaiStore.set(
          workflowSelectedNodeComponentState.atomFamily({
            instanceId: workflowVersionId,
          }),
          stepId,
        );
      }

      navigateCommandMenu({
        page: CommandMenuPages.WorkflowStepView,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });
    },
    [navigateCommandMenu],
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

      jotaiStore.set(
        commandMenuWorkflowIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowId,
      );
      jotaiStore.set(
        commandMenuWorkflowRunIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowRunId,
      );
      jotaiStore.set(
        commandMenuWorkflowStepIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        workflowSelectedNode,
      );

      jotaiStore.set(
        workflowSelectedNodeComponentState.atomFamily({
          instanceId: workflowRunId,
        }),
        workflowSelectedNode,
      );

      navigateCommandMenu({
        page: CommandMenuPages.WorkflowRunStepView,
        pageTitle: title,
        pageIcon: icon,
        pageId,
      });

      setInitialWorkflowRunRightDrawerTab({
        workflowSelectedNode,
        stepExecutionStatus,
      });
    },
    [navigateCommandMenu, setInitialWorkflowRunRightDrawerTab],
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
