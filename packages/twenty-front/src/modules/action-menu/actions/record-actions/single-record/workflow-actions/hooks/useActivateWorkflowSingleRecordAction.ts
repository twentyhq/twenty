import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useActivateWorkflowSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const { activateWorkflowVersion } = useActivateWorkflowVersion();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const shouldBeRegistered =
      isDefined(workflowWithCurrentVersion?.currentVersion?.trigger) &&
      isDefined(workflowWithCurrentVersion.currentVersion?.steps) &&
      workflowWithCurrentVersion.currentVersion.steps.length > 0 &&
      (workflowWithCurrentVersion.currentVersion.status === 'DRAFT' ||
        !workflowWithCurrentVersion.versions?.some(
          (version) => version.status === 'ACTIVE',
        ));

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
