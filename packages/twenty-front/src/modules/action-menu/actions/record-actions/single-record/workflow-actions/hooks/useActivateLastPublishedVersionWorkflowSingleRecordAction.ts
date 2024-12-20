import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useActivateLastPublishedVersionWorkflowSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const { activateWorkflowVersion } = useActivateWorkflowVersion();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const shouldBeRegistered =
      isDefined(workflowWithCurrentVersion) &&
      isDefined(workflowWithCurrentVersion.currentVersion.trigger) &&
      isDefined(workflowWithCurrentVersion.lastPublishedVersionId) &&
      workflowWithCurrentVersion.currentVersion.status !== 'ACTIVE' &&
      isDefined(workflowWithCurrentVersion.currentVersion?.steps) &&
      workflowWithCurrentVersion.currentVersion?.steps.length !== 0;

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      activateWorkflowVersion({
        workflowVersionId: workflowWithCurrentVersion.lastPublishedVersionId,
        workflowId: workflowWithCurrentVersion.id,
      });
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
