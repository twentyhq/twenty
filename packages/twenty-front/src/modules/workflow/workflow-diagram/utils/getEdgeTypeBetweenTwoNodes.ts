import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import { type WorkflowDiagramEdgeType } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const getEdgeTypeBetweenTwoNodes = ({
  workflowContext,
}: {
  workflowContext: WorkflowContext;
}): WorkflowDiagramEdgeType => {
  switch (workflowContext) {
    case 'workflow': {
      return 'editable';
    }
    case 'workflow-version':
    case 'workflow-run': {
      return 'readonly';
    }
  }
};
