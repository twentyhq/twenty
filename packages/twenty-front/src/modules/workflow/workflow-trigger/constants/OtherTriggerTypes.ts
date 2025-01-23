import { WorkflowTriggerType } from '@/workflow/types/Workflow';
import { IconComponent, IconHandMove } from 'twenty-ui';

export const OTHER_TRIGGER_TYPES: Array<{
  name: string;
  type: WorkflowTriggerType;
  icon: IconComponent;
}> = [
  {
    name: 'Launch manually',
    type: 'MANUAL',
    icon: IconHandMove,
  },
];
