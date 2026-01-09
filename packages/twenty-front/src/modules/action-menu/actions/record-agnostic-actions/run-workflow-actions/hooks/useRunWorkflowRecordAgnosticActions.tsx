import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowManualTriggers } from '@/workflow/hooks/useWorkflowManualTriggers';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRunWorkflowRecordAgnosticActions = () => {
  const { getIcon } = useIcons();

  const { actionMenuType } = useContext(ActionMenuContext);

  const { records: manualTriggers } = useWorkflowManualTriggers({
    skip:
      actionMenuType !== 'command-menu' &&
      actionMenuType !== 'command-menu-show-page-action-menu-dropdown',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  return manualTriggers.map((manualTrigger, index) => {
    const name = capitalize(manualTrigger.workflowName);

    const Icon = getIcon(
      manualTrigger.settings?.icon,
      COMMAND_MENU_DEFAULT_ICON,
    );

    return {
      type: ActionType.WorkflowRun,
      key: `workflow-run-${manualTrigger.workflowVersionId}`,
      scope: ActionScope.Global,
      label: name,
      shortLabel: name,
      position: index,
      isPinned: manualTrigger.settings?.isPinned,
      Icon,
      shouldBeRegistered: () => true,
      component: (
        <Action
          onClick={() => {
            runWorkflowVersion({
              workflowVersionId: manualTrigger.workflowVersionId,
              workflowId: manualTrigger.workflowId,
            });
          }}
          closeSidePanelOnCommandMenuListActionExecution={false}
        />
      ),
    };
  });
};
