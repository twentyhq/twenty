import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useDiscardDraftWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry } = useActionMenuEntries();

  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const registerDiscardDraftWorkflowSingleRecordAction = () => {
    if (
      !isDefined(workflowWithCurrentVersion) ||
      workflowWithCurrentVersion.versions.length < 2
    ) {
      return;
    }

    const isDraft =
      workflowWithCurrentVersion.currentVersion.status === 'DRAFT';

    if (!isDraft) {
      return;
    }

    addActionMenuEntry({
      ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.discardWorkflowDraftSingleRecord,
      onClick: () => {
        deleteOneWorkflowVersion({
          workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
        });
      },
    });
  };

  return {
    registerDiscardDraftWorkflowSingleRecordAction,
  };
};
