import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const DeactivateWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow(
    getWorkflowVisualizerComponentInstanceId({ recordId: recordId ?? '' }),
  );
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );

  if (!isDefined(recordId)) {
    throw new Error(
      doNotTranslate('Record ID is required to deactivate workflow'),
    );
  }

  const handleExecute = async () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    await saveUnsavedWorkflowFlow();

    return deactivateWorkflowVersion({
      workflowVersionId:
        workflowWithCurrentVersion.lastPublishedVersionId ??
        workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflowWithCurrentVersion)}
    />
  );
};
