import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';

export const getActionIcon = (actionType: WorkflowActionType) => {
  switch (actionType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'FIND_RECORDS':
      return RECORD_ACTIONS.find((item) => item.type === actionType)?.icon;
    case 'FILTER':
      return 'IconFilter';
    case 'AI_AGENT':
      return AI_ACTIONS.find((item) => item.type === actionType)?.icon;
    case 'CODE':
    case 'HTTP_REQUEST':
    case 'SEND_EMAIL':
      return CORE_ACTIONS.find((item) => item.type === actionType)?.icon;
    case 'FORM':
      return HUMAN_INPUT_ACTIONS.find((item) => item.type === actionType)?.icon;
    case 'ITERATOR':
      return 'IconRepeat';
    default:
      return 'IconDefault';
  }
};
