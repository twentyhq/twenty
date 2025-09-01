import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const OTHER_ACTIONS: Array<{
  label: string;
  type: Extract<WorkflowActionType, 'ITERATOR'>;
  icon: string;
}> = [
  {
    label: 'Iterator',
    type: 'ITERATOR',
    icon: 'IconRepeat',
  },
];
