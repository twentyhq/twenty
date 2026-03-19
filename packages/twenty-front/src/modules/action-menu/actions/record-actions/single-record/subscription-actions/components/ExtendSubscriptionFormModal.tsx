import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import {
  StyledSubscriptionModal,
  StyledPreviewRow,
  StyledPreviewLabel,
  StyledActivatedBy,
  StyledModalFooter,
  StyledFormSection,
  StyledWarning,
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
import { TextArea } from '@/ui/input/components/TextArea';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionFontColor } from 'twenty-ui/layout';

type ExtendSubscriptionFormModalProps = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

export const ExtendSubscriptionFormModal = ({
  modalId,
  recordId,
  objectNameSingular,
}: ExtendSubscriptionFormModalProps) => {
  const [extensionMonthsInput, setExtensionMonthsInput] = useState('');
  const [offerReference, setOfferReference] = useState('');
  const [contractId, setContractId] = useState('');
  const [notes, setNotes] = useState('');
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

  const currentEndDate =
    isDefined(record) && isDefined(record.endDate)
      ? new Date(record.endDate as string)
      : null;

  const MAX_EXTENSION_MONTHS = 36;
  const extensionMonths = Number(extensionMonthsInput) || 0;
  const isWithdrawn = record?.accessStatus === 'WITHDRAWN';
  const exceedsMax = extensionMonths > MAX_EXTENSION_MONTHS;
  const missingContract = contractId.trim().length === 0;

  const isFormValid = extensionMonths > 0 && !isWithdrawn && !exceedsMax;

  const newEndDate = (() => {
    const baseDate = isDefined(currentEndDate) ? currentEndDate : new Date();
    if (extensionMonths > 0) {
      const result = new Date(baseDate);
      result.setMonth(result.getMonth() + extensionMonths);
      return result;
    }
    return null;
  })();

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting || !isDefined(newEndDate)) return;
    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: {
          endDate: newEndDate.toISOString(),
          finalEndDate: newEndDate.toISOString(),
          accessStatus: 'ACTIVE',
        },
      });

      try {
        const offerPart = offerReference.trim() || 'No offer';
        const noteTitle = `Extend: ${extensionMonths} months — ${offerPart}`;
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

      enqueueSuccessSnackBar({
        message: `Subscription extended by ${extensionMonths} months`,
      });
      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({ message: 'Failed to extend subscription' });
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
          title="Extend / Renew Subscription"
          fontColor={H1TitleFontColor.Primary}
        />
      </Modal.Header>
      <Modal.Content>
        <StyledFormSection>
          <Section fontColor={SectionFontColor.Primary}>
            <StyledPreviewRow>
              <StyledPreviewLabel>Current End Date:</StyledPreviewLabel>
              <span>{formatDate(currentEndDate)}</span>
            </StyledPreviewRow>
            {extensionMonths > 0 && (
              <StyledPreviewRow>
                <StyledPreviewLabel>New End Date:</StyledPreviewLabel>
                <span>{formatDate(newEndDate)}</span>
              </StyledPreviewRow>
            )}
          </Section>

          {isWithdrawn && (
            <StyledError>Cannot extend a withdrawn subscription.</StyledError>
          )}
          {exceedsMax && (
            <StyledError>
              Maximum extension is {MAX_EXTENSION_MONTHS} months.
            </StyledError>
          )}
          {missingContract && extensionMonths > 0 && (
            <StyledWarning>
              Consider linking a contract reference for audit purposes.
            </StyledWarning>
          )}

          <TextInput
            label="Extension Term (Months)"
            type="number"
            value={extensionMonthsInput}
            onChange={(value) => setExtensionMonthsInput(value)}
            placeholder="Enter number of months"
            fullWidth
          />

          <TextInput
            label="Pricing / Offer Reference"
            value={offerReference}
            onChange={(value) => setOfferReference(value)}
            placeholder="e.g. Renewal Standard -10%"
            fullWidth
          />

          <TextInput
            label="Contract ID"
            value={contractId}
            onChange={(value) => setContractId(value)}
            placeholder="Link to contract (optional)"
            fullWidth
          />

          <TextArea
            textAreaId="extend-subscription-notes"
            label="Notes (optional)"
            value={notes}
            onChange={(value) => setNotes(value)}
            placeholder="Additional notes..."
            minRows={3}
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
          title="Confirm Extension"
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledModalFooter>
    </StyledSubscriptionModal>
  );
};
