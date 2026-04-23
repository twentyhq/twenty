import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';

export const getWorkflowNodeIconKey = (data: WorkflowDiagramStepNodeData) => {
  switch (data.nodeType) {
    case 'trigger': {
      return data.icon;
    }
    case 'action': {
      return getActionIcon(data.actionType);
    }
  }
};
