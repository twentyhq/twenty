import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const MANUAL_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: 'Launch manually',
  type: 'MANUAL',
  icon: 'IconHandMove',
};
