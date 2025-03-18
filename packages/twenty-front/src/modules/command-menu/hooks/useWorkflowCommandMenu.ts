import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { IconBolt, IconComponent, IconSettingsAutomation } from 'twenty-ui';
import { v4 } from 'uuid';

export const useWorkflowCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openWorkflowTriggerTypeInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepSelectTriggerType,
          pageTitle: t`Trigger Type`,
          pageIcon: IconBolt,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openStepSelectInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepSelectAction,
          pageTitle: t`Select Action`,
          pageIcon: IconSettingsAutomation,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowEditStepInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepEdit,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowViewStepInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepView,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowRunViewStepInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowRunStepView,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    openWorkflowTriggerTypeInCommandMenu,
    openStepSelectInCommandMenu,
    openWorkflowEditStepInCommandMenu,
    openWorkflowViewStepInCommandMenu,
    openWorkflowRunViewStepInCommandMenu,
  };
};
