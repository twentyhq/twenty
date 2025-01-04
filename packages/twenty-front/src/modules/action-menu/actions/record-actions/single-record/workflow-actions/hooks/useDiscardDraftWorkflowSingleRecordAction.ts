import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useDiscardDraftWorkflowSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const shouldBeRegistered =
      isDefined(workflowWithCurrentVersion) &&
      workflowWithCurrentVersion.versions.length > 1 &&
      workflowWithCurrentVersion.currentVersion.status === 'DRAFT';

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      deleteOneWorkflowVersion({
        workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      });
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
