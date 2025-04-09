import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const useActivateWorkflowSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const { activateWorkflowVersion } = useActivateWorkflowVersion();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const onClick = () => {
      if (!isDefined(workflowWithCurrentVersion)) {
        return;
      }

      activateWorkflowVersion({
        workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
        workflowId: workflowWithCurrentVersion.id,
      });
    };

    return {
      onClick,
    };
  };
