import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const FLOW_ACTIONS: Array<{
  label: string;
  type: Extract<WorkflowActionType, 'ITERATOR' | 'FILTER'>;
  icon: string;
}> = [
  {
    label: 'Iterator',
    type: 'ITERATOR',
    icon: 'IconRepeat',
  },
  {
    label: 'Filter',
    type: 'FILTER',
    icon: 'IconFilter',
  },
];
