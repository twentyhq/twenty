import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { IconSettingsAutomation } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

export const WorkflowRunActionEffect = () => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const { enqueueSnackBar } = useSnackBar();

  const theme = useTheme();

  useEffect(() => {
    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      addActionMenuEntry({
        type: 'workflow-run',
        key: `workflow-run-${activeWorkflowVersion.id}`,
        label: capitalize(activeWorkflowVersion.workflow.name),
        position: index,
        Icon: IconSettingsAutomation,
        onClick: async () => {
          await runWorkflowVersion(activeWorkflowVersion.id);

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

    return () => {
      for (const activeWorkflowVersion of activeWorkflowVersions) {
        removeActionMenuEntry(`workflow-run-${activeWorkflowVersion.id}`);
      }
    };
  }, [
    activeWorkflowVersions,
    addActionMenuEntry,
    enqueueSnackBar,
    removeActionMenuEntry,
    runWorkflowVersion,
    theme.snackBar.success.color,
  ]);

  return null;
};
