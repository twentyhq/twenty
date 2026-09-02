import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';

import { RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID } from '@/object-core/workflows/versions/constants/RestoreCoreWorkflowVersionModalId';
import { useRestoreCoreWorkflowVersionAsDraft } from '@/object-core/workflows/versions/hooks/useRestoreCoreWorkflowVersionAsDraft';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

export const CoreWorkflowVersionRestoreButton = ({
  workflowId,
  workspaceWorkflowVersionId,
}: {
  workflowId: string;
  workspaceWorkflowVersionId: string;
}) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const {
    restoreCoreWorkflowVersionAsDraft,
    isRestoring,
    hasExistingDraft,
    isLoadingCoreWorkflowVersions,
  } = useRestoreCoreWorkflowVersionAsDraft({
    workflowId,
    workspaceWorkflowVersionId,
  });

  const handleRestoreClick = () => {
    if (hasExistingDraft) {
      openModal(RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID);

      return;
    }

    restoreCoreWorkflowVersionAsDraft();
  };

  return (
    <>
      <Button
        title={t`Restore`}
        variant="primary"
        accent="blue"
        size="small"
        disabled={isRestoring || isLoadingCoreWorkflowVersions}
        onClick={handleRestoreClick}
      />
      <ConfirmationModal
        modalInstanceId={RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID}
        title={t`A draft already exists`}
        subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
        confirmButtonText={t`Override Draft`}
        loading={isRestoring}
        onConfirmClick={restoreCoreWorkflowVersionAsDraft}
      />
    </>
  );
};
