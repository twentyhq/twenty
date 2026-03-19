import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import {
  StyledSubscriptionModal,
  StyledPreviewRow,
  StyledPreviewLabel,
  StyledActivatedBy,
  StyledModalFooter,
  StyledFormSection,
  StyledError,
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
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type Props = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

const OPTIONS = [
  { value: 'PAID', label: 'Paid (Upfront)' },
  { value: 'INSTALLMENTS', label: 'Installments' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'IN_DISPUTE', label: 'In Dispute' },
];

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: 1fr 1fr;
`;

const Card = styled.div<{ selected: boolean }>`
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

export const ChangePaymentPlanFormModal = ({
  modalId,
  recordId,
  objectNameSingular,
}: ChangePaymentPlanFormModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);
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

  const current = isDefined(record) ? (record.paymentStatus as string) : null;
  const currentLabel =
    OPTIONS.find((o) => o.value === current)?.label ?? 'Not set';
  const selectedLabel = OPTIONS.find((o) => o.value === selected)?.label ?? '';
  const isWithdrawn = record?.accessStatus === 'WITHDRAWN';
  const isSameAsCurrent = isDefined(selected) && selected === current;
  const isValid =
    isDefined(selected) &&
    reason.trim().length > 0 &&
    !isWithdrawn &&
    !isSameAsCurrent;

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleSubmit = async () => {
    if (!isValid || isSubmitting || !isDefined(selected)) return;
    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: { paymentStatus: selected },
      });

      try {
        const title = `Payment: ${currentLabel} → ${selectedLabel} — ${reason}`;
        const note = await createNote({ title });
        if (isDefined(note)) {
          await createNoteTarget({
            noteId: note.id,
            [buildTargetFieldName(objectNameSingular)]: recordId,
          });
        }
      } catch {
        // non-critical
      }

      enqueueSuccessSnackBar({
        message: `Payment plan changed to ${selectedLabel}`,
      });
      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({ message: 'Failed to change payment plan' });
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
          title="Change Payment Plan"
          fontColor={H1TitleFontColor.Primary}
        />
      </Modal.Header>
      <Modal.Content>
        <StyledFormSection>
          <div>
            <StyledPreviewRow>
              <StyledPreviewLabel>Current:</StyledPreviewLabel>
              <span>{currentLabel}</span>
            </StyledPreviewRow>
            {isDefined(selected) && (
              <StyledPreviewRow>
                <StyledPreviewLabel>New:</StyledPreviewLabel>
                <span>{selectedLabel}</span>
              </StyledPreviewRow>
            )}
          </div>

          {isWithdrawn && (
            <StyledError>
              Cannot change payment plan for a withdrawn subscription.
            </StyledError>
          )}
          {isSameAsCurrent && (
            <StyledError>
              Selected plan is the same as the current plan.
            </StyledError>
          )}

          <Grid>
            {OPTIONS.map((opt) => (
              <Card
                key={opt.value}
                selected={selected === opt.value}
                onClick={() => setSelected(opt.value)}
              >
                {opt.label}
                {current === opt.value ? ' (current)' : ''}
              </Card>
            ))}
          </Grid>

          <TextInput
            label="Reason"
            value={reason}
            onChange={(v) => setReason(v)}
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
          title="Confirm Change"
          variant="primary"
          accent="blue"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledModalFooter>
    </StyledSubscriptionModal>
  );
};
