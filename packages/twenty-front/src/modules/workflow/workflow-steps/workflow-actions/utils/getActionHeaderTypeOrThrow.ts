import { WorkflowActionType } from '@/workflow/types/Workflow';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared';

export const getActionHeaderTypeOrThrow = (actionType: WorkflowActionType) => {
  switch (actionType) {
    case 'CODE':
      return msg`Code`;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'FIND_RECORDS':
    case 'FORM':
      return msg`Action`;
    case 'SEND_EMAIL':
      return msg`Email`;
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
