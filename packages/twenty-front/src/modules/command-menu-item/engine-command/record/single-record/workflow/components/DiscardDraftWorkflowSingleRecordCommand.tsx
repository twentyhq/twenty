import { isDefined } from 'twenty-shared/utils';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { doNotTranslate } from 'twenty-shared/i18n';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDiscardCoreWorkflowDraft } from '@/object-core/workflows/hooks/useDiscardCoreWorkflowDraft';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';

export const DiscardDraftWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow(
    getWorkflowVisualizerComponentInstanceId({ recordId: recordId ?? '' }),
  );
  const { discardCoreWorkflowDraft } = useDiscardCoreWorkflowDraft();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    recordId ?? '',
  );

  if (!isDefined(recordId)) {
    throw new Error(
      doNotTranslate('Record ID is required to discard draft workflow'),
    );
  }

  const handleExecute = async () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    await savePendingWorkflowFlow();

    return discardCoreWorkflowDraft({
      coreWorkflowVersionId: workflowWithCurrentVersion.currentVersion.id,
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(workflowWithCurrentVersion)}
    />
  );
};
