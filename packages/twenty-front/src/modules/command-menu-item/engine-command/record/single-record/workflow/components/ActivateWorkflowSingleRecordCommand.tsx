import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const ActivateWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const recordId = selectedRecords[0]?.id;
  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow(
    getWorkflowVisualizerComponentInstanceId({ recordId: recordId ?? '' }),
  );

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );

  if (!isDefined(recordId)) {
    throw new Error(
      doNotTranslate('Record ID is required to activate workflow'),
    );
  }

  const handleExecute = async () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    await saveUnsavedWorkflowFlow();

    return activateWorkflowVersion({
      workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflowWithCurrentVersion)}
    />
  );
};
