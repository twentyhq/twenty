import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ActivateWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  const onClick = useCallback(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    activateWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      workflowId: workflowWithCurrentVersion.id,
    });
  }, [activateWorkflowVersion, workflowWithCurrentVersion]);

  return <Action onClick={onClick} />;
};
