import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { assertUnreachable } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const getActionIconColorOrThrow = (
  actionType: WorkflowActionType,
): string => {
  switch (actionType) {
    case 'CODE':
    case 'LOGIC_FUNCTION':
    case 'HTTP_REQUEST':
    case 'SEND_EMAIL':
    case 'DRAFT_EMAIL':
      return themeCssVariables.color.red;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'UPSERT_RECORD':
    case 'FIND_RECORDS':
      return themeCssVariables.font.color.tertiary;
    case 'FORM':
      return themeCssVariables.color.orange;
    case 'ITERATOR':
    case 'EMPTY':
    case 'FILTER':
    case 'IF_ELSE':
    case 'DELAY':
      return themeCssVariables.color.green12;
    case 'AI_AGENT':
      return themeCssVariables.color.pink;
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
