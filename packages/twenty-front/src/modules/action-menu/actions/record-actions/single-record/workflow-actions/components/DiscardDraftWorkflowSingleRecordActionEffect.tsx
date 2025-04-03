import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const DiscardDraftWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    deleteOneWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  }, [deleteOneWorkflowVersion, workflowWithCurrentVersion]);

  return null;
};
