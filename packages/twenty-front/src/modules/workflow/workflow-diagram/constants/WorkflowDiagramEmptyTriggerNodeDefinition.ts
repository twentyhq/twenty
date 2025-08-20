import { type WorkflowDiagramEmptyTriggerNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type Node } from '@xyflow/react';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION = {
  id: TRIGGER_STEP_ID,
  type: 'empty-trigger',
  data: {
    nodeType: 'empty-trigger',
    position: {
      x: 0,
      y: 0,
    },
  } satisfies WorkflowDiagramEmptyTriggerNodeData,
  position: {
    x: 0,
    y: 0,
  },
} satisfies Node<WorkflowDiagramEmptyTriggerNodeData>;
