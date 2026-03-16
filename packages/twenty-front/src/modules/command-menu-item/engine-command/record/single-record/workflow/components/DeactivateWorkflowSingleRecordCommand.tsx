import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const DeactivateWorkflowSingleRecordCommand = () => {
  const { recordId } = useEngineCommandExecutionContext();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to deactivate workflow');
  }

  const handleExecute = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    deactivateWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
