import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildShowPageURL } from '@/object-record/record-show/utils/buildShowPageURL';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { openOverrideWorkflowDraftConfirmationModalState } from '@/workflow/states/openOverrideWorkflowDraftConfirmationModalState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { useRecoilState } from 'recoil';

export const OverrideWorkflowDraftConfirmationModal = ({
  draftWorkflowVersionId,
  workflowVersionUpdateInput,
}: {
  draftWorkflowVersionId: string;
  workflowVersionUpdateInput: Pick<WorkflowVersion, 'trigger' | 'steps'>;
}) => {
  const [
    openOverrideWorkflowDraftConfirmationModal,
    setOpenOverrideWorkflowDraftConfirmationModal,
  ] = useRecoilState(openOverrideWorkflowDraftConfirmationModalState);

  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const handleOverrideDraft = async () => {
    await updateOneWorkflowVersion({
      idToUpdate: draftWorkflowVersionId,
      updateOneRecordInput: workflowVersionUpdateInput,
    });
  };

  return (
    <>
      <ConfirmationModal
        isOpen={openOverrideWorkflowDraftConfirmationModal}
        setIsOpen={setOpenOverrideWorkflowDraftConfirmationModal}
        title="A draft already exists"
        subtitle="A draft already exists for this workflow. Are you sure to erase it?"
        onConfirmClick={handleOverrideDraft}
        deleteButtonText={'Override Draft'}
        AdditionalButtons={
          <StyledCenteredButton
            to={buildShowPageURL(
              CoreObjectNameSingular.WorkflowVersion,
              draftWorkflowVersionId,
            )}
            variant="secondary"
            title="Go to Draft"
            fullWidth
          />
        }
      />
    </>
  );
};
