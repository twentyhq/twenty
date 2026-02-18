import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRunWorkflowRecordAgnosticActions = () => {
  const { getIcon } = useIcons();

  const isPageInEditMode = useRecoilComponentValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const { actionMenuType } = useContext(ActionMenuContext);

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({
      skip:
        actionMenuType !== 'command-menu' &&
        actionMenuType !== 'command-menu-show-page-action-menu-dropdown',
    });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  return activeWorkflowVersions
    .map((activeWorkflowVersion, index) => {
      if (!isDefined(activeWorkflowVersion.workflow)) {
        return undefined;
      }

      const name = capitalize(activeWorkflowVersion.workflow.name);

      const Icon = getIcon(
        activeWorkflowVersion.trigger?.settings.icon,
        COMMAND_MENU_DEFAULT_ICON,
      );

      return {
        type: ActionType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionScope.Global,
        label: name,
        shortLabel: name,
        position: index,
        isPinned:
          !isPageInEditMode &&
          activeWorkflowVersion.trigger?.settings?.isPinned,
        Icon,
        shouldBeRegistered: () => true,
        component: (
          <Action
            onClick={() => {
              runWorkflowVersion({
                workflowVersionId: activeWorkflowVersion.id,
                workflowId: activeWorkflowVersion.workflowId,
              });
            }}
            closeSidePanelOnCommandMenuListActionExecution={false}
          />
        ),
      };
    })
    .filter(isDefined);
};
