import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useDiscardDraftWorkflowSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
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
