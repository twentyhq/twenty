import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useRestoreWorkflowVersionAsDraft } from '@/object-core/workflows/versions/hooks/useRestoreWorkflowVersionAsDraft';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const RESTORE_WORKFLOW_VERSION_MODAL_ID = 'restore-workflow-version-modal';

const StyledContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const CoreWorkflowVersionPreviewActionsContent = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { previewedWorkflowVersion, cancelWorkflowVersionPreview } =
    usePreviewWorkflowVersion(workflowId);
  const { restoreWorkflowVersionAsDraft, isRestoring, hasExistingDraft } =
    useRestoreWorkflowVersionAsDraft(workflowId);

  if (!isDefined(previewedWorkflowVersion)) {
    return null;
  }

  const handleRestoreClick = () => {
    if (hasExistingDraft) {
      openModal(RESTORE_WORKFLOW_VERSION_MODAL_ID);

      return;
    }

    restoreWorkflowVersionAsDraft();
  };

  return (
    <>
      <StyledContainer>
        <Button
          title={t`Cancel`}
          variant="secondary"
          size="small"
          onClick={cancelWorkflowVersionPreview}
        />
        <Button
          title={t`Restore`}
          variant="primary"
          accent="blue"
          size="small"
          disabled={isRestoring}
          onClick={handleRestoreClick}
        />
      </StyledContainer>
      <ConfirmationModal
        modalInstanceId={RESTORE_WORKFLOW_VERSION_MODAL_ID}
        title={t`A draft already exists`}
        subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
        confirmButtonText={t`Override Draft`}
        loading={isRestoring}
        onConfirmClick={restoreWorkflowVersionAsDraft}
      />
    </>
  );
};
