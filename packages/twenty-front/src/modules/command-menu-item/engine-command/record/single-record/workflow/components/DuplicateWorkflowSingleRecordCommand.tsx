import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useDuplicateWorkflow } from '@/workflow/hooks/useDuplicateWorkflow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const workflow = useWorkflowWithCurrentVersion(recordId ?? '');
  const { duplicateWorkflow } = useDuplicateWorkflow();
  const navigate = useNavigateApp();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to duplicate workflow');
  }

  const handleExecute = async () => {
    if (!isDefined(workflow) || !isDefined(workflow.currentVersion)) {
      return;
    }

    const result = await duplicateWorkflow({
      workflowIdToDuplicate: workflow.id,
      workflowVersionIdToCopy: workflow.currentVersion.id,
    });

    if (isDefined(result) && isNonEmptyString(result.workflowId)) {
      enqueueSuccessSnackBar({
        message: t`Workflow duplicated successfully`,
      });

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: result.workflowId,
      });
    } else {
      enqueueErrorSnackBar({
        message: t`Failed to duplicate workflow`,
      });
    }
  };

  return isDefined(workflow) ? (
    <HeadlessEngineCommandWrapperEffect execute={handleExecute} />
  ) : null;
};
