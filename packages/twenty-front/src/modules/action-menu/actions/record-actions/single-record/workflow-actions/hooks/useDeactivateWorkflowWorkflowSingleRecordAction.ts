import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useDeactivateWorkflowWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry } = useActionMenuEntries();

  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isWorkflowActive =
    isDefined(workflowWithCurrentVersion) &&
    workflowWithCurrentVersion.currentVersion.status === 'ACTIVE';

  const registerDeactivateWorkflowWorkflowSingleRecordAction = () => {
    if (!isDefined(workflowWithCurrentVersion) || !isWorkflowActive) {
      return;
    }

    addActionMenuEntry({
      ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.deactivateWorkflowSingleRecord,
      onClick: () => {
        deactivateWorkflowVersion(workflowWithCurrentVersion.currentVersion.id);
      },
    });
  };

  return {
    registerDeactivateWorkflowWorkflowSingleRecordAction,
  };
};
