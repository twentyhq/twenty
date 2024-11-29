import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { IconPlayerPause, isDefined } from 'twenty-ui';

export const useDeactivateWorkflowWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
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
    if (
      !isDefined(workflowWithCurrentVersion) ||
      !isDefined(workflowWithCurrentVersion.currentVersion.trigger) ||
      !isWorkflowActive
    ) {
      return;
    }

    addActionMenuEntry({
      key: 'deactivate-workflow',
      label: 'Deactivate Workflow',
      position,
      Icon: IconPlayerPause,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      onClick: () => {
        isWorkflowActive
          ? deactivateWorkflowVersion(
              workflowWithCurrentVersion.currentVersion.id,
            )
          : activateWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
              workflowId: workflowWithCurrentVersion.id,
            });
      },
    });
  };

  const unregisterDeactivateWorkflowWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('deactivate-workflow');
  };

  return {
    registerDeactivateWorkflowWorkflowSingleRecordAction,
    unregisterDeactivateWorkflowWorkflowSingleRecordAction,
  };
};
