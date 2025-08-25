import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';

export const getOutputSchemaType = (
  stepType: WorkflowActionType | WorkflowTriggerType,
): 'RECORD' | 'DATABASE_EVENT' | 'FIND_RECORDS' | 'FORM' | 'CODE' | 'BASE' => {
  switch (stepType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'MANUAL':
      return 'RECORD';
    case 'DATABASE_EVENT':
      return 'DATABASE_EVENT';
    case 'FIND_RECORDS':
      return 'FIND_RECORDS';
    case 'FORM':
      return 'FORM';
    case 'CODE':
      return 'CODE';
    default:
      return 'BASE';
  }
};
