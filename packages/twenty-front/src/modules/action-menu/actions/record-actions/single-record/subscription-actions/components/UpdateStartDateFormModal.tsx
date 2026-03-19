/* eslint-disable lingui/no-unlocalized-strings */
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import {
  StyledSubscriptionModal,
  StyledPreviewRow,
  StyledPreviewLabel,
  StyledActivatedBy,
  StyledModalFooter,
  StyledFormSection,
  StyledError,
  formatDate,
  buildTargetFieldName,
} from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/shared-subscription-modal-styles';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionFontColor } from 'twenty-ui/layout';

type UpdateStartDateFormModalProps = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

export const UpdateStartDateFormModal = ({
  modalId,
  recordId,
  objectNameSingular,
}: UpdateStartDateFormModalProps) => {
  const [newDateInput, setNewDateInput] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { closeModal } = useModal();
  const { closeActionMenu } = useCloseActionMenu();
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord: createNote } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
  });
  const { createOneRecord: createNoteTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.NoteTarget,
  });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);

  const { record } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  const currentStartDate =
    isDefined(record) && isDefined(record.startDate)
      ? new Date(record.startDate as string)
      : null;

  const isWithdrawn = record?.accessStatus === 'WITHDRAWN';
  const isFormValid =
    newDateInput.trim().length > 0 && reason.trim().length > 0 && !isWithdrawn;

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const newDate = new Date(newDateInput);

      await updateOneRecord({
        objectNameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: {
          startDate: newDate.toISOString(),
        },
      });

      try {
        const noteTitle = `Start Date: ${formatDate(currentStartDate)} → ${formatDate(newDate)} — ${reason}`;
        const createdNote = await createNote({ title: noteTitle });

        if (isDefined(createdNote)) {
          await createNoteTarget({
            noteId: createdNote.id,
            [buildTargetFieldName(objectNameSingular)]: recordId,
          });
        }
      } catch {
        // non-critical
      }

      enqueueSuccessSnackBar({ message: 'Start date updated' });
      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({ message: 'Failed to update start date' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledSubscriptionModal
      modalId={modalId}
      size="medium"
      padding="large"
      ignoreContainer
      dataGloballyPreventClickOutside
      shouldCloseModalOnClickOutsideOrEscape={false}
    >
      <Modal.Header>
        <H1Title
          title="Update Program Start Date"
          fontColor={H1TitleFontColor.Primary}
        />
      </Modal.Header>
      <Modal.Content>
        <StyledFormSection>
          <Section fontColor={SectionFontColor.Primary}>
            <StyledPreviewRow>
              <StyledPreviewLabel>Current Start Date:</StyledPreviewLabel>
              <span>{formatDate(currentStartDate)}</span>
            </StyledPreviewRow>
          </Section>

          {isWithdrawn && (
            <StyledError>
              Cannot update start date for a withdrawn subscription.
            </StyledError>
          )}

          <TextInput
            label="New Start Date"
            type="date"
            value={newDateInput}
            onChange={(value) => setNewDateInput(value)}
            placeholder="Select a date"
            fullWidth
          />

          <TextInput
            label="Reason"
            value={reason}
            onChange={(value) => setReason(value)}
            placeholder="Enter reason for change"
            fullWidth
          />

          <StyledActivatedBy>Activated by: {memberName}</StyledActivatedBy>
        </StyledFormSection>
      </Modal.Content>
      <StyledModalFooter>
        <Button
          title="Cancel"
          variant="secondary"
          onClick={() => closeModal(modalId)}
        />
        <Button
          title="Confirm Update"
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledModalFooter>
    </StyledSubscriptionModal>
  );
};
