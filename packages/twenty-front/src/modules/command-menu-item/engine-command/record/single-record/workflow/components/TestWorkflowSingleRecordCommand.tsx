import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { useWorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { getTestPayloadFromTrigger } from '@/workflow/workflow-trigger/utils/getTestPayloadFromTrigger';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const TestWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow(
    getWorkflowVisualizerComponentInstanceId({ recordId: recordId ?? '' }),
  );
  const { runWorkflowVersion } = useRunWorkflowVersion();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );
  const { content } = useWorkflowVersionContent(
    workflowWithCurrentVersion?.currentVersion.id,
  );

  if (!isDefined(recordId)) {
    throw new Error(doNotTranslate('Record ID is required to test workflow'));
  }

  const handleExecute = async () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    const { currentVersion } = workflowWithCurrentVersion;

    if (!isDefined(content) || !isDefined(content.trigger)) {
      return;
    }

    await saveUnsavedWorkflowFlow();

    return runWorkflowVersion({
      workflowVersionId: currentVersion.id,
      workflowId: workflowWithCurrentVersion.id,
      payload: getTestPayloadFromTrigger(content.trigger),
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflowWithCurrentVersion) && isDefined(content)}
    />
  );
};
