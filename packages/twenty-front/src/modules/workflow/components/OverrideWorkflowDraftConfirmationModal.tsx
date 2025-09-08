import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID } from '@/workflow/constants/OverrideWorkflowDraftConfirmationModalId';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useLingui } from '@lingui/react/macro';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getAppPath } from '~/utils/navigation/getAppPath';

export const OverrideWorkflowDraftConfirmationModal = ({
  workflowId,
  workflowVersionIdToCopy,
}: {
  workflowId: string;
  workflowVersionIdToCopy: string;
}) => {
  const { closeModal } = useModal();

  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();

  const navigate = useNavigateApp();

  const handleOverrideDraft = async () => {
    await createDraftFromWorkflowVersion({
      workflowId,
      workflowVersionIdToCopy,
    });

    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
    });
  };

  const { t } = useLingui();

  return (
    <>
      <ConfirmationModal
        modalId={OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID}
        title={t`A draft already exists`}
        subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
        onConfirmClick={handleOverrideDraft}
        confirmButtonText={t`Override Draft`}
        AdditionalButtons={
          <StyledCenteredButton
            to={getAppPath(AppPath.RecordShowPage, {
              objectNameSingular: CoreObjectNameSingular.Workflow,
              objectRecordId: workflowId,
            })}
            onClick={() => {
              closeModal(OVERRIDE_WORKFLOW_DRAFT_CONFIRMATION_MODAL_ID);
            }}
            variant="secondary"
            title={t`Go to Draft`}
            fullWidth
          />
        }
      />
    </>
  );
};
