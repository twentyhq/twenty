import { type WorkflowTriggerType } from '@/workflow/types/Workflow';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';

export const RECORD_IS_DELETED_TRIGGER: {
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
} = {
  defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_DELETED,
  type: 'DATABASE_EVENT',
  icon: 'IconTrash',
  event: 'deleted',
};
