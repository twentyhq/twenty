/* eslint-disable lingui/no-unlocalized-strings */
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import {
  StyledSubscriptionModal,
  StyledActivatedBy,
  StyledModalFooter,
  StyledFormSection,
  StyledPreviewRow,
  StyledPreviewLabel,
  buildTargetFieldName,
} from '@/action-menu/actions/record-actions/single-record/subscription-actions/components/shared-subscription-modal-styles';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
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

type BulkCreateTasksFormModalProps = {
  modalId: string;
  selectedRecordIds: string[];
  objectNameSingular: string;
};

export const BulkCreateTasksFormModal = ({
  modalId,
  selectedRecordIds,
  objectNameSingular,
}: BulkCreateTasksFormModalProps) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const { closeModal } = useModal();
  const { closeActionMenu } = useCloseActionMenu();
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);

  const count = selectedRecordIds.length;
  const isFormValid = title.trim().length > 0 && dueDate.trim().length > 0;

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setProgress(0);

    let created = 0;
    let failed = 0;

    for (const recordId of selectedRecordIds) {
      try {
        const taskInput: Record<string, unknown> = {
          title,
          status: 'TODO',
        };
        if (dueDate.trim().length > 0) {
          taskInput.dueAt = new Date(dueDate).toISOString();
        }

        const createdTask = await createTask(taskInput);

        if (isDefined(createdTask)) {
          await createTaskTarget({
            taskId: createdTask.id,
            [buildTargetFieldName(objectNameSingular)]: recordId,
          });
        }

        created++;
      } catch {
        failed++;
      }

      setProgress(created + failed);
    }

    if (created > 0) {
      enqueueSuccessSnackBar({
        message: `Created ${created} tasks${failed > 0 ? ` (${failed} failed)` : ''}`,
      });
    } else {
      enqueueErrorSnackBar({ message: 'Failed to create tasks' });
    }

    closeModal(modalId);
    closeActionMenu();
    setIsSubmitting(false);
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
          title="Create Follow-up Tasks"
          fontColor={H1TitleFontColor.Primary}
        />
      </Modal.Header>
      <Modal.Content>
        <StyledFormSection>
          <StyledPreviewRow>
            <StyledPreviewLabel>Subscriptions selected:</StyledPreviewLabel>
            <span>{count}</span>
          </StyledPreviewRow>

          {isSubmitting && (
            <StyledPreviewRow>
              <StyledPreviewLabel>Progress:</StyledPreviewLabel>
              <span>
                {progress} / {count}
              </span>
            </StyledPreviewRow>
          )}

          <TextInput
            label="Task Title"
            value={title}
            onChange={(value) => setTitle(value)}
            placeholder="e.g. Follow-up call"
            fullWidth
            disabled={isSubmitting}
          />

          <TextInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(value) => setDueDate(value)}
            placeholder="Select a date"
            fullWidth
            disabled={isSubmitting}
          />

          <TextArea
            textAreaId="bulk-tasks-notes"
            label="Notes (optional)"
            value={notes}
            onChange={(value) => setNotes(value)}
            placeholder="Additional context..."
            minRows={3}
            disabled={isSubmitting}
          />

          <StyledActivatedBy>Activated by: {memberName}</StyledActivatedBy>
        </StyledFormSection>
      </Modal.Content>
      <StyledModalFooter>
        <Button
          title="Cancel"
          variant="secondary"
          onClick={() => closeModal(modalId)}
          disabled={isSubmitting}
        />
        <Button
          title={
            isSubmitting
              ? `Creating... ${progress}/${count}`
              : `Create ${count} Tasks`
          }
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledModalFooter>
    </StyledSubscriptionModal>
  );
};
