import { Action } from '@/action-menu/actions/components/Action';
import { CommandMenuItemScope } from '@/action-menu/actions/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/action-menu/actions/types/CommandMenuItemType';
import { CommandMenuItemContext } from '@/action-menu/contexts/CommandMenuItemContext';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRunWorkflowRecordAgnosticActions = () => {
  const { getIcon } = useIcons();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const { actionMenuType } = useContext(CommandMenuItemContext);

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
        type: CommandMenuItemType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: CommandMenuItemScope.Global,
        label: name,
        shortLabel: name,
        position: index,
        isPinned:
          !contextStoreIsPageInEditMode &&
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
            closeSidePanelOnCommandMenuItemListActionExecution={false}
          />
        ),
      };
    })
    .filter(isDefined);
};
