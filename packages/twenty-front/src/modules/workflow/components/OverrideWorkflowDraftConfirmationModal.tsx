import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { useRecoilState } from 'recoil';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getAppPath } from '~/utils/navigation/getAppPath';

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
            to={getAppPath(AppPath.RecordShowPage, {
              objectNameSingular: CoreObjectNameSingular.Workflow,
              objectRecordId: workflowId,
            })}
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
