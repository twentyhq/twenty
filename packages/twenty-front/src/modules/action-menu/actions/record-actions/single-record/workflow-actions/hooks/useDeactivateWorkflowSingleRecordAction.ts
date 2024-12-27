import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useDeactivateWorkflowSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();

    const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

    const shouldBeRegistered =
      isDefined(workflowWithCurrentVersion) &&
      workflowWithCurrentVersion.currentVersion.status === 'ACTIVE';

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      deactivateWorkflowVersion(workflowWithCurrentVersion.currentVersion.id);
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
