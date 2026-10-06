import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const WAIT_FOR_EVENT_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'WAIT_FOR_EVENT'>;
  icon: string;
} = {
  defaultLabel: 'Wait for Event',
  type: 'WAIT_FOR_EVENT',
  icon: 'IconHourglass',
};
