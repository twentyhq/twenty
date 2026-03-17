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

type PauseSubscriptionFormModalProps = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

const StyledPauseFormModal = styled(Modal)`
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const formatDate = (date: Date | null): string => {
  if (!isDefined(date)) {
    return 'Not set';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const PauseSubscriptionFormModal = ({
  modalId,
  recordId,
  objectNameSingular,
}: PauseSubscriptionFormModalProps) => {
  const [pauseDaysInput, setPauseDaysInput] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { closeModal } = useModal();
  const { closeActionMenu } = useCloseActionMenu();
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord: createNote } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
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

  const currentPauseDays =
    isDefined(record) &&
    isDefined(record.pauseDays) &&
    typeof record.pauseDays === 'number'
      ? record.pauseDays
      : 0;

  const pauseDays = Number(pauseDaysInput) || 0;
  const isFormValid = pauseDays > 0 && reason.trim().length > 0;

  const newEndDate =
    isDefined(currentEndDate) && pauseDays > 0
      ? new Date(currentEndDate.getTime() + pauseDays * MS_PER_DAY)
      : currentEndDate;

  const totalPauseDays = currentPauseDays + pauseDays;

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleCancel = () => {
    closeModal(modalId);
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateOneRecord({
        objectNameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: {
          accessStatus: 'PAUSED',
          pauseDays: totalPauseDays,
          ...(isDefined(newEndDate) && {
            endDate: newEndDate.toISOString(),
            finalEndDate: newEndDate.toISOString(),
          }),
        },
      });

      const noteBody = [
        `Pause Duration: ${pauseDays} days`,
        `Reason: ${reason}`,
        isDefined(notes) && notes.trim().length > 0 ? `Notes: ${notes}` : null,
        `Activated by: ${memberName}`,
        `Date: ${new Date().toLocaleDateString('en-GB')}`,
        `Previous End Date: ${formatDate(currentEndDate)}`,
        `New End Date: ${formatDate(newEndDate)}`,
        `Total Accumulated Pause Days: ${totalPauseDays}`,
      ]
        .filter(isDefined)
        .join('\n');

      await createNote({
        title: `Pause: ${pauseDays} days`,
        body: noteBody,
      });

      enqueueSuccessSnackBar({
        message: `Subscription paused for ${pauseDays} days`,
      });

      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({
        message: 'Failed to pause subscription',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledPauseFormModal
      modalId={modalId}
      size="medium"
      padding="large"
      ignoreContainer
      dataGloballyPreventClickOutside
      shouldCloseModalOnClickOutsideOrEscape={false}
    >
      <Modal.Header>
        <H1Title
          title="Pause Subscription"
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
            {pauseDays > 0 && (
              <StyledPreviewRow>
                <StyledPreviewLabel>New End Date:</StyledPreviewLabel>
                <span>{formatDate(newEndDate)}</span>
              </StyledPreviewRow>
            )}
            {currentPauseDays > 0 && (
              <StyledPreviewRow>
                <StyledPreviewLabel>Previous Pause Days:</StyledPreviewLabel>
                <span>{currentPauseDays}</span>
              </StyledPreviewRow>
            )}
          </Section>

          <TextInput
            label="Pause Duration (Days)"
            type="number"
            value={pauseDaysInput}
            onChange={(value) => setPauseDaysInput(value)}
            placeholder="Enter number of days"
            fullWidth
          />

          <TextInput
            label="Reason"
            value={reason}
            onChange={(value) => setReason(value)}
            placeholder="Enter pause reason"
            fullWidth
          />

          <TextArea
            textAreaId="pause-subscription-notes"
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
          title="Confirm Pause"
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledFooter>
    </StyledPauseFormModal>
  );
};
