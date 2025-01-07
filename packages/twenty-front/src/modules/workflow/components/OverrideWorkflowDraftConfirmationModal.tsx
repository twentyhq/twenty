import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

export const OverrideWorkflowDraftConfirmationModal = ({
  workflowId,
  workflowVersionIdToCopy,
}: {
  workflowId: string;
  workflowVersionIdToCopy: string;
}) => {
  const [
    openOverrideWorkflowDraftConfirmationModal,
    setOpenOverrideWorkflowDraftConfirmationModal,
  ] = useRecoilState(openOverrideWorkflowDraftConfirmationModalState);

  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();

  const navigate = useNavigate();

  const handleOverrideDraft = async () => {
    await createDraftFromWorkflowVersion({
      workflowId,
      workflowVersionIdToCopy,
    });

    navigate(buildShowPageURL(CoreObjectNameSingular.Workflow, workflowId));
  };

  return (
    <>
      <ConfirmationModal
        isOpen={openOverrideWorkflowDraftConfirmationModal}
        setIsOpen={setOpenOverrideWorkflowDraftConfirmationModal}
        title="A draft already exists"
        subtitle="A draft already exists for this workflow. Are you sure you want to erase it?"
        onConfirmClick={handleOverrideDraft}
        deleteButtonText={'Override Draft'}
        AdditionalButtons={
          <StyledCenteredButton
            to={buildShowPageURL(CoreObjectNameSingular.Workflow, workflowId)}
            onClick={() => {
              setOpenOverrideWorkflowDraftConfirmationModal(false);
            }}
            variant="secondary"
            title="Go to Draft"
            fullWidth
          />
        }
      />
    </>
  );
};
