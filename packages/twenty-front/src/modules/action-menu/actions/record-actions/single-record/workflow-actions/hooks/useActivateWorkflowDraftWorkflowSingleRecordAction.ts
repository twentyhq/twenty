import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useActivateWorkflowDraftWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry } = useActionMenuEntries();

  const { activateWorkflowVersion } = useActivateWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const registerActivateWorkflowDraftWorkflowSingleRecordAction = () => {
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
      ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.activateWorkflowDraftSingleRecord,
      onClick: () => {
        activateWorkflowVersion({
          workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
          workflowId: workflowWithCurrentVersion.id,
        });
      },
    });
  };

  return {
    registerActivateWorkflowDraftWorkflowSingleRecordAction,
  };
};
