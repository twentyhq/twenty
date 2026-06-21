import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULTS } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStickyNoteDefaults';
import { useUpdateWorkflowVersionStickyNotes } from '@/workflow/workflow-diagram/hooks/useUpdateWorkflowVersionStickyNotes';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type WorkflowStickyNote } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

export const useWorkflowDiagramStickyNotes = () => {
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const { updateStickyNotes } = useUpdateWorkflowVersionStickyNotes();

  const getWorkflowVersionFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  // Read from the resolved updatable version: editing an Active workflow mints
  // a fresh draft whose notes the server already cloned, so the snapshot must
  // come from that draft, not the version that was current before promotion.
  const applyStickyNotesChange = async (
    change: (
      stickyNotes: Array<WorkflowStickyNote>,
    ) => Array<WorkflowStickyNote>,
  ) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const currentStickyNotes =
      getWorkflowVersionFromCache<WorkflowVersion>(workflowVersionId)?.notes ??
      [];

    await updateStickyNotes(workflowVersionId, change(currentStickyNotes));
  };

  const createStickyNote = async (position: { x: number; y: number }) => {
    const newStickyNote: WorkflowStickyNote = {
      id: v4(),
      content: '',
      position,
      size: WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULTS.size,
      color: WORKFLOW_DIAGRAM_STICKY_NOTE_DEFAULTS.color,
    };

    await applyStickyNotesChange((stickyNotes) => [
      ...stickyNotes,
      newStickyNote,
    ]);

    return newStickyNote.id;
  };

  const updateStickyNote = async (
    stickyNoteId: string,
    changes: Partial<Omit<WorkflowStickyNote, 'id'>>,
  ) => {
    await applyStickyNotesChange((stickyNotes) =>
      stickyNotes.map((stickyNote) =>
        stickyNote.id === stickyNoteId
          ? { ...stickyNote, ...changes }
          : stickyNote,
      ),
    );
  };

  const removeStickyNote = async (stickyNoteId: string) => {
    await applyStickyNotesChange((stickyNotes) =>
      stickyNotes.filter((stickyNote) => stickyNote.id !== stickyNoteId),
    );
  };

  return { createStickyNote, updateStickyNote, removeStickyNote };
};
