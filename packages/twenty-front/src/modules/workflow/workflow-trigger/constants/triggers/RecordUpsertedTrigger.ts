import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';

export const RECORD_UPSERTED_TRIGGER: {
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
} = {
  defaultLabel: DatabaseTriggerDefaultLabel.RECORD_UPSERTED,
  type: 'DATABASE_EVENT',
  icon: 'IconPencilPlus',
  event: 'upserted',
};
