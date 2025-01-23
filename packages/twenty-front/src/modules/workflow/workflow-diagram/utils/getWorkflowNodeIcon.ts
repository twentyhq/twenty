import {
  WorkflowActionType,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import {
  IconAddressBook,
  IconCode,
  IconHandMove,
  IconMail,
  IconPlaylistAdd,
} from 'twenty-ui';

export const getWorkflowNodeIcon = (
  data:
    | {
        nodeType: 'trigger';
        triggerType: WorkflowTriggerType;
      }
    | {
        nodeType: 'action';
        actionType: WorkflowActionType;
      },
) => {
  switch (data.nodeType) {
    case 'trigger': {
      switch (data.triggerType) {
        case 'DATABASE_EVENT': {
          return IconPlaylistAdd;
        }
        case 'MANUAL': {
          return IconHandMove;
        }
      }

      return assertUnreachable(data.triggerType);
    }
    case 'action': {
      switch (data.actionType) {
        case 'CODE': {
          return IconCode;
        }
        case 'SEND_EMAIL': {
          return IconMail;
        }
        case 'CREATE_RECORD':
        case 'UPDATE_RECORD':
        case 'DELETE_RECORD': {
          return IconAddressBook;
        }
      }

      return assertUnreachable(data.actionType);
    }
  }
};
