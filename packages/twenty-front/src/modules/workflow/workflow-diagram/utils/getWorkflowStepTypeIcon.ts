import { WorkflowStepType } from '@/workflow/types/Workflow';
import { IconAddressBook, IconCode, IconMail } from 'twenty-ui';

export const getWorkflowStepTypeIcon = (stepType: WorkflowStepType) => {
  switch (stepType) {
    case 'CODE':
      return IconCode;
    case 'SEND_EMAIL':
      return IconMail;
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
      return IconAddressBook;
  }
};
