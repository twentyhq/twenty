import { EMPTY_NODE_ID } from '@/workflow/workflow-diagram/constants/EmptyNodeId';
import { type WorkflowDiagramStepNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WORKFLOW_DIAGRAM_EMPTY_NODE_DEFINITION = {
  id: EMPTY_NODE_ID,
  type: 'empty',
  selected: false,
  selectable: false,
  draggable: false,
  deletable: false,
  connectable: true,
  focusable: false,
  data: {
    nodeType: 'action',
    actionType: 'EMPTY',
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- The canvas replaces this fallback with a translated label when rendering.
    name: 'Add an Action',
    hasNextStepIds: false,
    stepId: EMPTY_NODE_ID,
    position: {
      x: 0,
      y: 0,
    },
  },
  position: {
    x: 0,
    y: 0,
  },
} satisfies WorkflowDiagramStepNode;
