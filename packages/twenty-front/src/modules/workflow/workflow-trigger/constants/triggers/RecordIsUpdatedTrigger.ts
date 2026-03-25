import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';

export const RECORD_IS_UPDATED_TRIGGER: {
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
} = {
  defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_UPDATED,
  type: 'DATABASE_EVENT',
  icon: 'IconRefreshDot',
  event: 'updated',
};
