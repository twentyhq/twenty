import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';

export const useDeactivateWorkflowWorkflowSingleRecordAction: SingleRecordActionHook =
  (recordId) => {
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
