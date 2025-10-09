import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

export const getActionHeaderTypeOrThrow = (actionType: WorkflowActionType) => {
  switch (actionType) {
    case 'CODE':
      return msg`Code`;
    case 'CREATE_RECORD':
      return msg`Create Record`;
    case 'UPDATE_RECORD':
      return msg`Update Record`;
    case 'DELETE_RECORD':
    case 'UPSERT_RECORD':
      return msg`Delete Record`;
    case 'FIND_RECORDS':
      return msg`Find Records`;
    case 'FORM':
      return msg`Form`;
    case 'SEND_EMAIL':
      return msg`Send Email`;
    case 'DELAY':
      return msg`Delay`;
    case 'HTTP_REQUEST':
      return msg`HTTP Request`;
    case 'AI_AGENT':
      return msg`AI Agent`;
    case 'FILTER': {
      return msg`Filter`;
    }
    case 'ITERATOR': {
      return msg`Iterator`;
    }
    case 'EMPTY': {
      return msg`Add an Action`;
    }
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
