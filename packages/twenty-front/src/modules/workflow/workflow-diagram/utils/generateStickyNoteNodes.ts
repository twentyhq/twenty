import { type WorkflowDiagramStickyNoteNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type WorkflowStickyNote } from 'twenty-shared/workflow';

export const generateStickyNoteNodes = (
  stickyNotes: Array<WorkflowStickyNote>,
): Array<WorkflowDiagramStickyNoteNode> =>
  stickyNotes.map((stickyNote) => ({
    id: stickyNote.id,
    type: 'sticky-note',
    position: stickyNote.position,
    style: {
      width: stickyNote.size.width,
      height: stickyNote.size.height,
    },
    zIndex: -1,
    draggable: true,
    selectable: true,
    deletable: false,
    data: {
      nodeType: 'sticky-note',
      noteId: stickyNote.id,
      content: stickyNote.content,
      color: stickyNote.color,
      size: stickyNote.size,
      position: stickyNote.position,
    },
  }));
