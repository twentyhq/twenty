import { WorkflowDiagramEmptyTriggerNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { Node } from '@xyflow/react';

export const WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION = {
  id: TRIGGER_STEP_ID,
  type: 'empty-trigger',
  data: {
    nodeType: 'empty-trigger',
  } satisfies WorkflowDiagramEmptyTriggerNodeData,
  position: {
    x: 0,
    y: 0,
  },
} satisfies Node<WorkflowDiagramEmptyTriggerNodeData>;
