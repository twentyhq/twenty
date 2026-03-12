import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const TestWorkflowSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { runWorkflowVersion } = useRunWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);

  const handleExecute = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    runWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
      workflowId: workflowWithCurrentVersion.id,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
