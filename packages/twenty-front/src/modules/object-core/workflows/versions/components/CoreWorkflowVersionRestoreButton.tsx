import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

import { RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID } from '@/object-core/workflows/versions/constants/RestoreCoreWorkflowVersionModalId';
import { useRestoreCoreWorkflowVersionAsDraft } from '@/object-core/workflows/versions/hooks/useRestoreCoreWorkflowVersionAsDraft';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

export const CoreWorkflowVersionRestoreButton = ({
  workflowId,
  coreWorkflowVersionId,
}: {
  workflowId: string;
  coreWorkflowVersionId: string;
}) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const {
    restoreCoreWorkflowVersionAsDraft,
    isRestoring,
    hasExistingDraft,
    isLoadingCoreWorkflowVersions,
  } = useRestoreCoreWorkflowVersionAsDraft({
    workflowId,
    coreWorkflowVersionId,
  });

  const handleRestoreClick = () => {
    if (hasExistingDraft) {
      openDialog(RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID);

      return;
    }

    restoreCoreWorkflowVersionAsDraft();
  };

  return (
    <>
      <Button
        size="sm"
        disabled={isRestoring || isLoadingCoreWorkflowVersions}
        onClick={handleRestoreClick}
        variant="solid"
        color="accent"
      >{t`Restore`}</Button>
      <ConfirmationDialog
        dialogId={RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID}
        title={t`A draft already exists`}
        subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
        confirmButtonText={t`Override Draft`}
        loading={isRestoring}
        onConfirmClick={restoreCoreWorkflowVersionAsDraft}
      />
    </>
  );
};
