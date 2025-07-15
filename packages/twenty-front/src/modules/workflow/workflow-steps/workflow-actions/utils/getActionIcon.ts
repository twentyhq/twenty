import { WorkflowActionType } from '@/workflow/types/Workflow';
import { OTHER_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/OtherActions';
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
    default:
      return OTHER_ACTIONS.find((item) => item.type === actionType)?.icon;
  }
};
