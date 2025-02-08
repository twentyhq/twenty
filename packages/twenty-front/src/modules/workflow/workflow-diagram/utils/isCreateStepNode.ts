import { CREATE_STEP_STEP_ID } from '@/workflow/workflow-diagram/constants/CreateStepStepId';
import {
  WorkflowDiagramCreateStepNodeData,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const isCreateStepNode = (
  node: WorkflowDiagramNode,
): node is WorkflowDiagramNode & {
  data: WorkflowDiagramCreateStepNodeData;
} => {
  return (
    node.type === CREATE_STEP_STEP_ID && node.data.nodeType === 'create-step'
  );
};
