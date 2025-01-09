import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
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

export const useWorkflowRunActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const addWorkflowRunActions = () => {
    if (!isWorkflowEnabled) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      if (!isDefined(activeWorkflowVersion.workflow)) {
        continue;
      }

      const name = capitalize(activeWorkflowVersion.workflow.name);

      addActionMenuEntry({
        type: ActionMenuEntryType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionMenuEntryScope.Global,
        label: name,
        position: index,
        Icon: IconSettingsAutomation,
        onClick: async () => {
          await runWorkflowVersion({
            workflowVersionId: activeWorkflowVersion.id,
            workflowName: name,
          });
        },
      });
    }
  };

  const removeWorkflowRunActions = () => {
    for (const activeWorkflowVersion of activeWorkflowVersions) {
      removeActionMenuEntry(`workflow-run-${activeWorkflowVersion.id}`);
    }
  };

  return { addWorkflowRunActions, removeWorkflowRunActions };
};
