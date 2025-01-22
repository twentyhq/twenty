import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import {
  IconAddressBook,
  IconCode,
  IconHandMove,
  IconMail,
  IconPlaylistAdd,
} from 'twenty-ui';

export const getWorkflowNodeIcon = (data: WorkflowDiagramStepNodeData) => {
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
