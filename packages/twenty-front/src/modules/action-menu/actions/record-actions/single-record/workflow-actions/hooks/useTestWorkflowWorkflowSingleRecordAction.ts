import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { IconPlayerPlay, isDefined } from 'twenty-ui';

export const useTestWorkflowWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const registerTestWorkflowWorkflowSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (
      !isDefined(workflowWithCurrentVersion?.currentVersion?.trigger) ||
      workflowWithCurrentVersion.currentVersion.trigger.type !== 'MANUAL' ||
      isDefined(
        workflowWithCurrentVersion.currentVersion.trigger.settings.objectType,
      )
    ) {
      return;
    }

    addActionMenuEntry({
      key: 'test-workflow-single-record',
      label: 'Test workflow',
      position,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      Icon: IconPlayerPlay,
      onClick: () => {
        runWorkflowVersion({
          workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
          workflowName: workflowWithCurrentVersion.name,
        });
      },
    });
  };

  const unregisterTestWorkflowWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('test-workflow-single-record');
  };

  return {
    registerTestWorkflowWorkflowSingleRecordAction,
    unregisterTestWorkflowWorkflowSingleRecordAction,
  };
};
