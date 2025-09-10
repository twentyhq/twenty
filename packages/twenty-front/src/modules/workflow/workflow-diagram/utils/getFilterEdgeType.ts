import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import { type WorkflowDiagramEdgeType } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const getFilterEdgeType = ({
  workflowContext,
}: {
  workflowContext: WorkflowContext;
}): WorkflowDiagramEdgeType => {
  switch (workflowContext) {
    case 'workflow': {
      return 'filter--editable';
    }
    case 'workflow-version': {
      return 'filter--readonly';
    }
    case 'workflow-run': {
      return 'filter--run';
    }
  }
};
