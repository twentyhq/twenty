import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { useTheme } from '@emotion/react';
import { IconSettingsAutomation } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

export const useWorkflowRunActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const { enqueueSnackBar } = useSnackBar();

  const theme = useTheme();

  const addWorkflowRunActions = () => {
    if (!isWorkflowEnabled) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      addActionMenuEntry({
        type: ActionMenuEntryType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionMenuEntryScope.Global,
        label: capitalize(activeWorkflowVersion.workflow.name),
        position: index,
        Icon: IconSettingsAutomation,
        onClick: async () => {
          await runWorkflowVersion({
            workflowVersionId: activeWorkflowVersion.id,
          });

          enqueueSnackBar('', {
            variant: SnackBarVariant.Success,
            title: `${capitalize(activeWorkflowVersion.workflow.name)} starting...`,
            icon: (
              <IconSettingsAutomation
                size={16}
                color={theme.snackBar.success.color}
              />
            ),
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
