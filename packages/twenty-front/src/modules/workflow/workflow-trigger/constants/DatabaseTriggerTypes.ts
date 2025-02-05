import { WorkflowTriggerType } from 'twenty-shared';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';

export const DATABASE_TRIGGER_TYPES: Array<{
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
}> = [
  {
    defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
    type: WorkflowTriggerType.DATABASE_EVENT,
    icon: 'IconPlus',
    event: 'created',
  },
  {
    defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_UPDATED,
    type: WorkflowTriggerType.DATABASE_EVENT,
    icon: 'IconRefreshDot',
    event: 'updated',
  },
  {
    defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_DELETED,
    type: WorkflowTriggerType.DATABASE_EVENT,
    icon: 'IconTrash',
    event: 'deleted',
  },
];
