import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { assertUnreachable } from 'twenty-shared/utils';

export const getActionIconStrokeOrThrow = (
  actionType: WorkflowActionType,
): 'sm' | undefined => {
  switch (actionType) {
    case 'CODE':
    case 'LOGIC_FUNCTION':
    case 'HTTP_REQUEST':
    case 'SEND_EMAIL':
    case 'DRAFT_EMAIL':
    case 'CREATE_CALENDAR_EVENT':
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'UPSERT_RECORD':
    case 'FIND_RECORDS':
    case 'PICK_RECORD':
    case 'IF_ELSE':
      return 'sm';
    case 'FORM':
    case 'ITERATOR':
    case 'EMPTY':
    case 'FILTER':
    case 'DELAY':
    case 'AI_AGENT':
    case 'CLASSIFY':
      return undefined;
    default:
      return assertUnreachable(
        actionType,
        `Unsupported action type: ${actionType}`,
      );
  }
};
