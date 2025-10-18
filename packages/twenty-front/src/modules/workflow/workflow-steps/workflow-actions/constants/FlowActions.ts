import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const FLOW_ACTIONS: Array<{
  label: string;
  type: Extract<WorkflowActionType, 'ITERATOR' | 'FILTER' | 'DELAY'>;
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
  {
    label: 'Delay',
    type: 'DELAY',
    icon: 'IconPlayerPause',
  },
];
