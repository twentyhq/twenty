import { WorkflowTriggerType } from 'twenty-shared';

export const OTHER_TRIGGER_TYPES: Array<{
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
}> = [
  {
    defaultLabel: 'Launch manually',
    type: WorkflowTriggerType.MANUAL,
    icon: 'IconHandMove',
  },
];
