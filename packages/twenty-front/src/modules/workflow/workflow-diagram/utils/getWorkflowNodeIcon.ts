import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { OTHER_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/OtherActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';

export const getWorkflowNodeIcon = (
  data: WorkflowDiagramStepNodeData,
) => {
  switch (data.nodeType) {
    case 'trigger': {
      return data.icon;
    }
    case 'action': {
      switch (data.actionType) {
        case 'CODE':
        case 'SEND_EMAIL': {
          return OTHER_ACTIONS.find(
            (action) => action.type === data.actionType,
          )?.icon;
        }
        case 'CREATE_RECORD':
        case 'UPDATE_RECORD':
        case 'DELETE_RECORD': {
          return RECORD_ACTIONS.find(
            (action) => action.type === data.actionType,
          )?.icon;
        }
      }

      return assertUnreachable(data.actionType);
    }
  }
};
