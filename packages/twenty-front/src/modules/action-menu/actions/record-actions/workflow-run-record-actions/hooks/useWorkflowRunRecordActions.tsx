import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAllActiveWorkflowVersions } from '@/workflow/hooks/useAllActiveWorkflowVersions';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';

import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { IconSettingsAutomation, isDefined } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

export const useWorkflowRunRecordActions = ({
  recordId,
  objectMetadataItem,
}: {
  recordId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const { records: activeWorkflowVersions } = useAllActiveWorkflowVersions({
    objectMetadataItem,
    triggerType: 'MANUAL',
  });

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const { enqueueSnackBar } = useSnackBar();

  const theme = useTheme();

  const registerWorkflowRunRecordActions = () => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      addActionMenuEntry({
        type: ActionMenuEntryType.WorkflowRun,
        key: `workflow-run-${activeWorkflowVersion.id}`,
        scope: ActionMenuEntryScope.RecordSelection,
        label: capitalize(activeWorkflowVersion.workflow.name),
        position: index,
        Icon: IconSettingsAutomation,
        onClick: async () => {
          if (!isDefined(selectedRecord)) {
            return;
          }

          await runWorkflowVersion({
            workflowVersionId: activeWorkflowVersion.id,
            payload: selectedRecord,
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

  const unregisterWorkflowRunRecordActions = () => {
    for (const activeWorkflowVersion of activeWorkflowVersions) {
      removeActionMenuEntry(`workflow-run-${activeWorkflowVersion.id}`);
    }
  };

  return {
    registerWorkflowRunRecordActions,
    unregisterWorkflowRunRecordActions,
  };
};
