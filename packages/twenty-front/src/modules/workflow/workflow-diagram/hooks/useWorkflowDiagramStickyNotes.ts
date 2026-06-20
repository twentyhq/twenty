import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULT_COLOR,
  WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULT_SIZE,
} from '@/workflow/workflow-diagram/constants/WorkflowDiagramStickyNoteDefaults';
import { useUpdateWorkflowVersionStickyNotes } from '@/workflow/workflow-diagram/hooks/useUpdateWorkflowVersionStickyNotes';
import { type WorkflowStickyNote } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

export const useWorkflowDiagramStickyNotes = () => {
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const { updateStickyNotes } = useUpdateWorkflowVersionStickyNotes();

  const stickyNotes = workflowWithCurrentVersion?.currentVersion?.notes ?? [];

  const persistStickyNotes = async (notes: Array<WorkflowStickyNote>) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    await updateStickyNotes(workflowVersionId, notes);
  };

  const createStickyNote = async (position: { x: number; y: number }) => {
    const newStickyNote: WorkflowStickyNote = {
      id: v4(),
      content: '',
      position,
      size: WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULT_SIZE,
      color: WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULT_COLOR,
    };

    await persistStickyNotes([...stickyNotes, newStickyNote]);

    return newStickyNote.id;
  };

  const updateStickyNote = async (
    stickyNoteId: string,
    changes: Partial<Omit<WorkflowStickyNote, 'id'>>,
  ) => {
    await persistStickyNotes(
      stickyNotes.map((stickyNote) =>
        stickyNote.id === stickyNoteId
          ? { ...stickyNote, ...changes }
          : stickyNote,
      ),
    );
  };

  const removeStickyNote = async (stickyNoteId: string) => {
    await persistStickyNotes(
      stickyNotes.filter((stickyNote) => stickyNote.id !== stickyNoteId),
    );
  };

  return { createStickyNote, updateStickyNote, removeStickyNote };
};
