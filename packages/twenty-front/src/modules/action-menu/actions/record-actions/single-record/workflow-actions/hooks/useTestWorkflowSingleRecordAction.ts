import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useTestWorkflowSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const { runWorkflowVersion } = useRunWorkflowVersion();

    const shouldBeRegistered =
      isDefined(workflowWithCurrentVersion?.currentVersion?.trigger) &&
      workflowWithCurrentVersion.currentVersion.trigger.type === 'MANUAL' &&
      !isDefined(
        workflowWithCurrentVersion.currentVersion.trigger.settings.objectType,
      );

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      runWorkflowVersion({
        workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
        workflowName: workflowWithCurrentVersion.name,
      });
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
