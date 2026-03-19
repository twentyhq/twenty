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

type PauseSubscriptionFormModalProps = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_PAUSE_DAYS = 90;
const MAX_TOTAL_PAUSE_DAYS = 180;

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

  const currentPauseDays =
    isDefined(record) &&
    isDefined(record.pauseDays) &&
    typeof record.pauseDays === 'number'
      ? record.pauseDays
      : 0;

  const pauseDays = Number(pauseDaysInput) || 0;
  const totalPauseDays = currentPauseDays + pauseDays;

  const isAlreadyPaused = record?.accessStatus === 'PAUSED';
  const isExpired =
    isDefined(currentEndDate) && currentEndDate.getTime() < Date.now();
  const exceedsMaxPause = pauseDays > MAX_PAUSE_DAYS;
  const exceedsTotalMax = totalPauseDays > MAX_TOTAL_PAUSE_DAYS;

  const isFormValid =
    pauseDays > 0 &&
    reason.trim().length > 0 &&
    !exceedsMaxPause &&
    !exceedsTotalMax;

  const newEndDate =
    isDefined(currentEndDate) && pauseDays > 0
      ? new Date(currentEndDate.getTime() + pauseDays * MS_PER_DAY)
      : currentEndDate;

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
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

      try {
        const noteTitle = `Pause: ${pauseDays} days — ${reason}`;
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
        message: `Subscription paused for ${pauseDays} days`,
      });
      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({ message: 'Failed to pause subscription' });
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

          {isAlreadyPaused && (
            <StyledWarning>
              This subscription is already paused. Adding more days will extend
              the current pause.
            </StyledWarning>
          )}
          {isExpired && (
            <StyledWarning>This subscription has already ended.</StyledWarning>
          )}
          {exceedsMaxPause && (
            <StyledError>
              Maximum single pause is {MAX_PAUSE_DAYS} days.
            </StyledError>
          )}
          {exceedsTotalMax && (
            <StyledError>
              Total pause days ({totalPauseDays}) would exceed the maximum of{' '}
              {MAX_TOTAL_PAUSE_DAYS} days.
            </StyledError>
          )}

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
      <StyledModalFooter>
        <Button
          title="Cancel"
          variant="secondary"
          onClick={() => closeModal(modalId)}
        />
        <Button
          title="Confirm Pause"
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledModalFooter>
    </StyledSubscriptionModal>
  );
};
