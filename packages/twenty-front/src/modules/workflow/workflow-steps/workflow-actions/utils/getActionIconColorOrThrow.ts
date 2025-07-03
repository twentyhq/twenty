import { WorkflowActionType } from '@/workflow/types/Workflow';
import { Theme } from '@emotion/react';
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
      return theme.color.orange;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'FIND_RECORDS':
    case 'FORM':
      return theme.font.color.tertiary;
    case 'SEND_EMAIL':
      return theme.color.blue;
    case 'AI_AGENT':
      return theme.color.pink;
    case 'FILTER': {
      throw new Error(
        "The Filter action isn't meant to be displayed as a node.",
      );
    }
    default:
      assertUnreachable(actionType, `Unsupported action type: ${actionType}`);
  }
};
