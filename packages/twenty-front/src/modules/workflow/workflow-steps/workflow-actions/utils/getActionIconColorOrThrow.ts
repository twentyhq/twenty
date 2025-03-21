import { WorkflowActionType } from '@/workflow/types/Workflow';
import { Theme } from '@emotion/react';
import { assertUnreachable } from 'twenty-shared';

export const getActionIconColorOrThrow = ({
  theme,
  actionType,
}: {
  theme: Theme;
  actionType: WorkflowActionType;
}) => {
  switch (actionType) {
    case 'CODE':
      return theme.color.orange;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'FIND_RECORDS':
    case 'FORM':
      return theme.font.color.tertiary;
    case 'SEND_EMAIL':
      return theme.color.blue;
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
