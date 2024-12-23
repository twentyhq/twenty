import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useActivateDraftWorkflowSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const { activateWorkflowVersion } = useActivateWorkflowVersion();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const shouldBeRegistered =
      isDefined(workflowWithCurrentVersion?.currentVersion?.trigger) &&
      isDefined(workflowWithCurrentVersion.currentVersion?.steps) &&
      workflowWithCurrentVersion.currentVersion.status === 'DRAFT';

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      activateWorkflowVersion({
        workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
        workflowId: workflowWithCurrentVersion.id,
      });
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
