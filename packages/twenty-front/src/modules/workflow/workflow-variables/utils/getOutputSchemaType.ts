import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';

export const getOutputSchemaType = (
  stepType: WorkflowActionType | WorkflowTriggerType,
): 'RECORD' | 'BASE' => {
  switch (stepType) {
    case 'CREATE_RECORD':
    case 'UPDATE_RECORD':
    case 'DELETE_RECORD':
    case 'MANUAL':
      return 'RECORD';
    default:
      return 'BASE';
  }
};
