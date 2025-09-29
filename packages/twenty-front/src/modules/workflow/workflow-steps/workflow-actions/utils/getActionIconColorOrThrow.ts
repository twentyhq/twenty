import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type Theme } from '@emotion/react';
import { assertUnreachable } from 'twenty-shared/utils';

export const getActionIconColorOrThrow = ({
  theme,
  actionType,
}: {
  theme: Theme;
  actionType: WorkflowActionType;
}) => {
  switch (actionType) {
    case 'CODE':
    case 'HTTP_REQUEST':
    case 'SEND_EMAIL':
      return theme.color.red;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'FIND_RECORDS':
      return theme.font.color.tertiary;
    case 'FORM':
      return theme.color.orange;
    case 'ITERATOR':
    case 'FILTER':
    case 'EMPTY':
      return theme.font.color.tertiary;
    case 'AI_AGENT':
      return theme.color.pink;
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
