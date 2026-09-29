import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { assertUnreachable } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

export const getActionIconColorOrThrow = (
  actionType: WorkflowActionType,
): string => {
  switch (actionType) {
    case 'CODE':
    case 'LOGIC_FUNCTION':
    case 'HTTP_REQUEST':
    case 'SEND_EMAIL':
    case 'DRAFT_EMAIL':
    case 'CREATE_CALENDAR_EVENT':
      return themeCssVariables.color.red9;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'UPSERT_RECORD':
    case 'FIND_RECORDS':
    case 'PICK_RECORD':
      return themeCssVariables.color.gray9;
    case 'FORM':
      return themeCssVariables.color.orange9;
    case 'ITERATOR':
    case 'EMPTY':
    case 'FILTER':
    case 'IF_ELSE':
    case 'DELAY':
      return themeCssVariables.color.green9;
    case 'AI_AGENT':
    case 'CLASSIFY':
      return themeCssVariables.color.pink9;
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
