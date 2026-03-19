/* eslint-disable lingui/no-unlocalized-strings */
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import {
  StyledSubscriptionModal,
  StyledActivatedBy,
  StyledModalFooter,
  StyledFormSection,
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
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type OpenCaseFormModalProps = {
  modalId: string;
  recordId: string;
  objectNameSingular: string;
};

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const StyledGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: 1fr 1fr;
`;

const StyledCard = styled.div<{ selected: boolean }>`
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  text-align: center;
  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

export const OpenCaseFormModal = ({
  modalId,
  recordId,
  objectNameSingular,
}: OpenCaseFormModalProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { closeModal } = useModal();
  const { closeActionMenu } = useCloseActionMenu();
  const { createOneRecord: createTask } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Task,
  });
  const { createOneRecord: createTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });
  const { createOneRecord: createNote } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Note,
  });
  const { createOneRecord: createNoteTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.NoteTarget,
  });
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);

  const isFormValid = title.trim().length > 0 && isDefined(priority);

  const memberName = isDefined(currentMember)
    ? `${currentMember.name.firstName} ${currentMember.name.lastName}`.trim()
    : 'Unknown';

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const taskInput: Record<string, unknown> = {
        title: `[${priority}] ${title}`,
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

      try {
        const noteTitle = `Case opened: ${title} (Priority: ${priority})`;
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

      enqueueSuccessSnackBar({ message: 'Case opened successfully' });
      closeModal(modalId);
      closeActionMenu();
    } catch {
      enqueueErrorSnackBar({ message: 'Failed to open case' });
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
          title="Open Case / Escalation"
          fontColor={H1TitleFontColor.Primary}
        />
      </Modal.Header>
      <Modal.Content>
        <StyledFormSection>
          <TextInput
            label="Case Title"
            value={title}
            onChange={(value) => setTitle(value)}
            placeholder="Describe the issue"
            fullWidth
          />

          <StyledGrid>
            {PRIORITIES.map((p) => (
              <StyledCard
                key={p.value}
                selected={priority === p.value}
                onClick={() => setPriority(p.value)}
              >
                {p.label}
              </StyledCard>
            ))}
          </StyledGrid>

          <TextInput
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(value) => setDueDate(value)}
            placeholder="Select a date"
            fullWidth
          />

          <TextArea
            textAreaId="open-case-notes"
            label="Notes (optional)"
            value={notes}
            onChange={(value) => setNotes(value)}
            placeholder="Additional context..."
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
          title="Open Case"
          variant="primary"
          accent="blue"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        />
      </StyledModalFooter>
    </StyledSubscriptionModal>
  );
};
