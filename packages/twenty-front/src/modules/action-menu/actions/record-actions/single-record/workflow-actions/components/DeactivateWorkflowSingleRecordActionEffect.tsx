import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const DeactivateWorkflowSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  useActionEffect(() => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    deactivateWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  }, [deactivateWorkflowVersion, workflowWithCurrentVersion]);

  return null;
};
