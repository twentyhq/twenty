import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const isNodeTitleHighlighted = ({
  nodeType,
  actionType,
}: {
  nodeType: WorkflowDiagramStepNodeData['nodeType'];
  actionType?: WorkflowActionType;
}) => {
  return !(nodeType === 'action' && actionType === 'EMPTY');
};
