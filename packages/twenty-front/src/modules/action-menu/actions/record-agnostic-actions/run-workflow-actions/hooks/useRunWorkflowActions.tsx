import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { capitalize } from 'twenty-shared';
import { IconSettingsAutomation, isDefined } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRunWorkflowActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  if (!isWorkflowEnabled) {
    return { runWorkflowActions: [] };
  }

  const runWorkflowActions = Array.from(activeWorkflowVersions.values())
    .map((activeWorkflowVersion, index) => {
      if (!isDefined(activeWorkflowVersion.workflow)) {
        return undefined;
      }

      const name = capitalize(activeWorkflowVersion.workflow.name);

      return {
        type: ActionMenuEntryType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionMenuEntryScope.Global,
        label: name,
        position: index,
        Icon: IconSettingsAutomation,
        actionHook: () => {
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
