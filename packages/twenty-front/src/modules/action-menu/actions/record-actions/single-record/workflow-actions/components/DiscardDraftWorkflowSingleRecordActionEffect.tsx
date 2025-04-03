import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const DiscardDraftWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useActionEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    deleteOneWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  }, [deleteOneWorkflowVersion, workflowWithCurrentVersion]);

  return null;
};
