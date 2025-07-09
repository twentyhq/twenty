import { WorkflowActionType } from '@/workflow/types/Workflow';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getActionHeaderTypeOrThrow = (actionType: WorkflowActionType) => {
  switch (actionType) {
    case 'CODE':
      return msg`Code`;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'FIND_RECORDS':
    case 'FORM':
    case 'SEND_EMAIL':
      return msg`Action`;
    case 'HTTP_REQUEST':
      return msg`HTTP Request`;
    case 'AI_AGENT':
      return msg`AI Agent`;
    case 'FILTER': {
      return msg`Filter`;
    }

    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
