import { Command } from '@/command-menu-item/display/components/Command';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRunWorkflowRecordAgnosticCommands = () => {
  const { getIcon } = useIcons();

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const { containerType } = useContext(CommandMenuContext);

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({
      skip:
        containerType !== 'command-menu-list' &&
        containerType !== 'command-menu-show-page-dropdown',
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
          <Command
            onClick={() => {
              runWorkflowVersion({
                workflowVersionId: activeWorkflowVersion.id,
                workflowId: activeWorkflowVersion.workflowId,
              });
            }}
            closeSidePanelOnCommandMenuListExecution={false}
          />
        ),
      };
    })
    .filter(isDefined);
};
