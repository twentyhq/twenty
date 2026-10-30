import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDuplicateWorkflow } from '@/workflow/hooks/useDuplicateWorkflow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useToast } from 'twenty-ui/components/feedback';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow(
    getWorkflowVisualizerComponentInstanceId({ recordId: recordId ?? '' }),
  );
  const workflow = useWorkflowWithCurrentVersion(recordId ?? '');
  const { duplicateWorkflow } = useDuplicateWorkflow();
  const navigate = useNavigateApp();
  const { enqueueToast } = useToast();
  const { t } = useLingui();

  if (!isDefined(recordId)) {
    throw new Error(
      doNotTranslate('Record ID is required to duplicate workflow'),
    );
  }

  const handleExecute = async () => {
    if (!isDefined(workflow) || !isDefined(workflow.currentVersion)) {
      return;
    }

    const { isSaved, savedDraftFlow } = await savePendingWorkflowFlow();

    if (!isSaved) {
      return;
    }

    const result = await duplicateWorkflow({
      workflowIdToDuplicate: workflow.id,
      workflowVersionIdToCopy:
        savedDraftFlow?.workflowVersionId ?? workflow.currentVersion.id,
    });

    if (isDefined(result) && isNonEmptyString(result.workflowId)) {
      enqueueToast({
        status: 'success',
        children: t`Workflow duplicated successfully`,
      });

      navigate(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: result.workflowId,
      });
    } else {
      enqueueToast({
        status: 'error',
        children: t`Failed to duplicate workflow`,
      });
    }
  };

  return isDefined(workflow) ? (
    <HeadlessEngineCommandWrapperEffect execute={handleExecute} />
  ) : null;
};
