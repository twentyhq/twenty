import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useTestWorkflowSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
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
