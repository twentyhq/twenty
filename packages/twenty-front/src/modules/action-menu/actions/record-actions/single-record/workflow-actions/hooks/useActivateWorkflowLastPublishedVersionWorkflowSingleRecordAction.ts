import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction =
  ({ workflowId }: { workflowId: string }) => {
    const { addActionMenuEntry } = useActionMenuEntries();

    const { activateWorkflowVersion } = useActivateWorkflowVersion();

    const workflowWithCurrentVersion =
      useWorkflowWithCurrentVersion(workflowId);

    const registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction =
      () => {
        if (
          !isDefined(workflowWithCurrentVersion) ||
          !isDefined(workflowWithCurrentVersion.currentVersion.trigger) ||
          !isDefined(workflowWithCurrentVersion.lastPublishedVersionId) ||
          workflowWithCurrentVersion.currentVersion.status === 'ACTIVE' ||
          !isDefined(workflowWithCurrentVersion.currentVersion?.steps) ||
          workflowWithCurrentVersion.currentVersion?.steps.length === 0
        ) {
          return;
        }

        addActionMenuEntry({
          ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.activateWorkflowLastPublishedVersionSingleRecord,
          onClick: () => {
            activateWorkflowVersion({
              workflowVersionId:
                workflowWithCurrentVersion.lastPublishedVersionId,
              workflowId: workflowWithCurrentVersion.id,
            });
          },
        });
      };

    return {
      registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
    };
  };
