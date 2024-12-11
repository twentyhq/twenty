import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useTestWorkflowWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry } = useActionMenuEntries();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const { runWorkflowVersion } = useRunWorkflowVersion();

  const registerTestWorkflowWorkflowSingleRecordAction = () => {
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
      ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.testWorkflowSingleRecord,
      onClick: () => {
        runWorkflowVersion({
          workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
          workflowName: workflowWithCurrentVersion.name,
        });
      },
    });
  };

  return {
    registerTestWorkflowWorkflowSingleRecordAction,
  };
};
