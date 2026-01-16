import { Action } from '@/action-menu/actions/components/Action';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useFilteredCommandMenuItems } from '@/command-menu-item/hooks/useFilteredCommandMenuItems';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated/graphql';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const useRunWorkflowRecordAgnosticActions = () => {
  const { getIcon } = useIcons();

  const { actionMenuType } = useContext(ActionMenuContext);

  const isCommandMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
  );

  const shouldSkip =
    actionMenuType !== 'command-menu' &&
    actionMenuType !== 'command-menu-show-page-action-menu-dropdown';

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({
      skip: shouldSkip || isCommandMenuItemEnabled,
    });

  const { commandMenuItems } = useFilteredCommandMenuItems({
    availabilityTypes: [CommandMenuItemAvailabilityType.GLOBAL],
    skip: shouldSkip || !isCommandMenuItemEnabled,
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const actionsFromWorkflowVersions = activeWorkflowVersions
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
        isPinned: activeWorkflowVersion.trigger?.settings?.isPinned,
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

  const actionsFromCommandMenuItems = commandMenuItems.map(
    (commandMenuItem, index) => {
      const Icon = getIcon(commandMenuItem.icon, COMMAND_MENU_DEFAULT_ICON);

      return {
        type: ActionType.WorkflowRun,
        key: `workflow-run-${commandMenuItem.id}`,
        scope: ActionScope.Global,
        label: commandMenuItem.label,
        shortLabel: commandMenuItem.label,
        position: index,
        isPinned: commandMenuItem.isPinned,
        Icon,
        shouldBeRegistered: () => true,
        component: (
          <Action
            onClick={() => {
              runWorkflowVersion({
                workflowVersionId: commandMenuItem.workflowVersionId,
              });
            }}
            closeSidePanelOnCommandMenuListActionExecution={false}
          />
        ),
      };
    },
  );

  return isCommandMenuItemEnabled
    ? actionsFromCommandMenuItems
    : actionsFromWorkflowVersions;
};
