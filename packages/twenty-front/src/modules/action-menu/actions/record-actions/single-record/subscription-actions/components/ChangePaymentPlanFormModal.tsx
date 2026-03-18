import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
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
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionFontColor } from 'twenty-ui/layout';

type ChangePaymentPlanFormModalProps = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

const PAYMENT_OPTIONS = [
  { value: 'PAID', label: 'Paid (Upfront)', color: 'green' },
  { value: 'INSTALLMENTS', label: 'Installments', color: 'blue' },
  { value: 'OVERDUE', label: 'Overdue', color: 'red' },
  { value: 'IN_DISPUTE', label: 'In Dispute', color: 'orange' },
] as const;

const StyledPaymentFormModal = styled(Modal)`
  height: auto;
`;

const StyledPreviewRow = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

const StyledPreviewLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledActivatedBy = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledFooter = styled(Modal.Footer)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledOptionsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: 1fr 1fr;
`;

const StyledOptionCard = styled.div<{ isSelected: boolean; accentColor: string }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border: 1px solid
    ${({ theme, isSelected, accentColor }) =>
      isSelected
        ? theme.tag.background[accentColor] || theme.border.color.medium
        : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledOptionDot = styled.div<{ color: string }>`
  background: ${({ theme, color }) => theme.tag.background[color] || theme.border.color.medium};
  border-radius: 50%;
  flex-shrink: 0;
  height: 10px;
  width: 10px;
`;

const StyledOptionLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledCheckmark = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-left: auto;
`;

export const ChangePaymentPlanFormModal = ({
  modalId,
  recordId,
  objectNameSingular,
}: ChangePaymentPlanFormModalProps) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [reason, setReason] = useState('');
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

  const currentPaymentStatus =
    isDefined(record) && isDefined(record.paymentStatus)
      ? (record.paymentStatus as string)
      : null;

  const currentPaymentLabel =
    PAYMENT_OPTIONS.find((opt) => opt.value === currentPaymentStatus)?.label ??
    'Not set';

  const selectedLabel =
    PAYMENT_OPTIONS.find((opt) => opt.value === selectedMode)?.label ?? '';

  const isFormValid =
    isDefined(selectedMode) && reason.trim().length > 0;

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleCancel = () => {
    closeModal(modalId);
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting || !isDefined(selectedMode)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: {
          paymentStatus: selectedMode,
        },
      });

      // Create audit note linked to this subscription
      try {
        const noteTitle = `Payment: ${currentPaymentLabel} → ${selectedLabel} — ${reason}`;

        const createdNote = await createNote({
          title: noteTitle,
        });

        if (isDefined(createdNote)) {
          const targetFieldName =
            'target' +
            objectNameSingular.charAt(0).toUpperCase() +
            objectNameSingular.slice(1) +
            'Id';

          await createNoteTarget({
            noteId: createdNote.id,
            [targetFieldName]: recordId,
          });
        }
      } catch {
        // Note creation is non-critical — subscription was already updated
      }

      enqueueSuccessSnackBar({
        message: `Payment plan changed to ${selectedLabel}`,
      });

      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({
        message: 'Failed to change payment plan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledPaymentFormModal
      modalId={modalId}
      size="medium"
      padding="large"
      ignoreContainer
      dataGloballyPreventClickOutside
      shouldCloseModalOnClickOutsideOrEscape={false}
    >
      <Modal.Header>
        <H1Title
          title="Change Payment Plan"
          fontColor={H1TitleFontColor.Primary}
        />
      </Modal.Header>
      <Modal.Content>
        <StyledFormSection>
          <Section fontColor={SectionFontColor.Primary}>
            <StyledPreviewRow>
              <StyledPreviewLabel>Current Payment Status:</StyledPreviewLabel>
              <span>{currentPaymentLabel}</span>
            </StyledPreviewRow>
            {isDefined(selectedMode) && (
              <StyledPreviewRow>
                <StyledPreviewLabel>New Payment Status:</StyledPreviewLabel>
                <span>{selectedLabel}</span>
              </StyledPreviewRow>
            )}
          </Section>

          <StyledOptionsGrid>
            {PAYMENT_OPTIONS.map((option) => (
              <StyledOptionCard
                key={option.value}
                isSelected={selectedMode === option.value}
                accentColor={option.color}
                onClick={() => setSelectedMode(option.value)}
              >
                <StyledOptionDot color={option.color} />
                <StyledOptionLabel>{option.label}</StyledOptionLabel>
                {currentPaymentStatus === option.value && (
                  <StyledCheckmark>current</StyledCheckmark>
                )}
              </StyledOptionCard>
            ))}
          </StyledOptionsGrid>

          <TextInput
            label="Reason"
            value={reason}
            onChange={(value) => setReason(value)}
            placeholder="Enter reason for change"
            fullWidth
          />

          <TextArea
            textAreaId="change-payment-notes"
            label="Notes (optional)"
            value={notes}
            onChange={(value) => setNotes(value)}
            placeholder="Additional notes..."
            minRows={3}
          />

          <StyledActivatedBy>Activated by: {memberName}</StyledActivatedBy>
        </StyledFormSection>
      </Modal.Content>
      <StyledFooter>
        <Button title="Cancel" variant="secondary" onClick={handleCancel} />
        <Button
          title="Confirm Change"
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledFooter>
    </StyledPaymentFormModal>
  );
};
