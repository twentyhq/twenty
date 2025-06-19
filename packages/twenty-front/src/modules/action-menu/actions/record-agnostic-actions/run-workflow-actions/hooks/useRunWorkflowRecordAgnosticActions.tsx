import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { msg } from '@lingui/core/macro';
import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';

export const useRunWorkflowRecordAgnosticActions = () => {
  const { getIcon } = useIcons();

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_ENABLED,
  );

  const { actionMenuType } = useContext(ActionMenuContext);

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({
      skip:
        actionMenuType !== 'command-menu' &&
        actionMenuType !== 'command-menu-show-page-action-menu-dropdown',
    });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  if (!isWorkflowEnabled) {
    return [];
  }

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
        label: msg`${name}`,
        position: index,
        Icon,
        shouldBeRegistered: () => true,
        component: (
          <Action
            onClick={() => {
              runWorkflowVersion({
                workflowVersionId: activeWorkflowVersion.id,
              });
            }}
            closeSidePanelOnCommandMenuListActionExecution={false}
          />
        ),
      };
    })
    .filter(isDefined);
};
