import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useActiveWorkflowVersionsWithManualTrigger } from '@/workflow/hooks/useActiveWorkflowVersionsWithManualTrigger';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { msg } from '@lingui/core/macro';
import { FeatureFlagKey } from '~/generated/graphql';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/display';

export const useRunWorkflowActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithManualTrigger({});

  const { runWorkflowVersion } = useRunWorkflowVersion();

  if (!isWorkflowEnabled) {
    return { runWorkflowActions: [] };
  }

  const runWorkflowActions = activeWorkflowVersions
    .map((activeWorkflowVersion, index) => {
      if (!isDefined(activeWorkflowVersion.workflow)) {
        return undefined;
      }

      const name = capitalize(activeWorkflowVersion.workflow.name);

      return {
        type: ActionMenuEntryType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionMenuEntryScope.Global,
        label: msg`${name}`,
        position: index,
        Icon: IconSettingsAutomation,
        useAction: () => {
          return {
            shouldBeRegistered: true,
            onClick: async () => {
              await runWorkflowVersion({
                workflowVersionId: activeWorkflowVersion.id,
              });
            },
          };
        },
      };
    })
    .filter(isDefined);

  return { runWorkflowActions };
};
