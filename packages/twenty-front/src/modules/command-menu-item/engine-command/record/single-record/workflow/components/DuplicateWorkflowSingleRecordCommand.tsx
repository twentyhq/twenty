import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useDuplicateWorkflow } from '@/workflow/hooks/useDuplicateWorkflow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateWorkflowSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflow = useWorkflowWithCurrentVersion(recordId);
  const { duplicateWorkflow } = useDuplicateWorkflow();
  const navigate = useNavigateApp();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

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
