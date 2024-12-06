import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { IconPower, isDefined } from 'twenty-ui';

export const useActivateWorkflowDraftWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const { activateWorkflowVersion } = useActivateWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const registerActivateWorkflowDraftWorkflowSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (
      !isDefined(workflowWithCurrentVersion?.currentVersion?.trigger) ||
      !isDefined(workflowWithCurrentVersion.currentVersion?.steps)
    ) {
      return;
    }

    const isDraft =
      workflowWithCurrentVersion.currentVersion.status === 'DRAFT';

    if (!isDraft) {
      return;
    }

    addActionMenuEntry({
      key: 'activate-workflow-draft-single-record',
      label: 'Activate Draft',
      position,
      Icon: IconPower,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      onClick: () => {
        activateWorkflowVersion({
          workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
          workflowId: workflowWithCurrentVersion.id,
        });
      },
    });
  };

  const unregisterActivateWorkflowDraftWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('activate-workflow-draft-single-record');
  };

  return {
    registerActivateWorkflowDraftWorkflowSingleRecordAction,
    unregisterActivateWorkflowDraftWorkflowSingleRecordAction,
  };
};
