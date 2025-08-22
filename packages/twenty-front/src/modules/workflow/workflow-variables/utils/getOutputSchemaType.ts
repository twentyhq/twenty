import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';

export const getOutputSchemaType = (
  stepType: WorkflowActionType | WorkflowTriggerType,
): 'RECORD' | 'DATABASE_EVENT' | 'BASE' => {
  switch (stepType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'MANUAL':
      return 'RECORD';
    case 'DATABASE_EVENT':
      return 'DATABASE_EVENT';
    default:
      return 'BASE';
  }
};
