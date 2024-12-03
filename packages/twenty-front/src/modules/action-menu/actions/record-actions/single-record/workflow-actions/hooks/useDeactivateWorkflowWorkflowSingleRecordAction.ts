import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { IconPlayerPause, isDefined } from 'twenty-ui';

export const useDeactivateWorkflowWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isWorkflowActive =
    isDefined(workflowWithCurrentVersion) &&
    workflowWithCurrentVersion.currentVersion.status === 'ACTIVE';

  const registerDeactivateWorkflowWorkflowSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (!isDefined(workflowWithCurrentVersion) || !isWorkflowActive) {
      return;
    }

    addActionMenuEntry({
      key: 'deactivate-workflow-single-record',
      label: 'Deactivate Workflow',
      position,
      Icon: IconPlayerPause,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      onClick: () => {
        deactivateWorkflowVersion(workflowWithCurrentVersion.currentVersion.id);
      },
    });
  };

  const unregisterDeactivateWorkflowWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('deactivate-workflow-single-record');
  };

  return {
    registerDeactivateWorkflowWorkflowSingleRecordAction,
    unregisterDeactivateWorkflowWorkflowSingleRecordAction,
  };
};
