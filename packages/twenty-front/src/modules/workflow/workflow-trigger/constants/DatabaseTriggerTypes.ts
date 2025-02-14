import { WorkflowTriggerType } from '@/workflow/types/Workflow';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';

export const DATABASE_TRIGGER_TYPES: Array<{
  defaultLabel: DatabaseTriggerDefaultLabel;
  type: WorkflowTriggerType;
  icon: string;
  event: string;
}> = [
  {
    defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
    type: 'DATABASE_EVENT',
    icon: 'IconPlaylistAdd',
    event: 'created',
  },
  {
    defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_UPDATED,
    type: 'DATABASE_EVENT',
    icon: 'IconRefreshDot',
    event: 'updated',
  },
  {
    defaultLabel: DatabaseTriggerDefaultLabel.RECORD_IS_DELETED,
    type: 'DATABASE_EVENT',
    icon: 'IconTrash',
    event: 'deleted',
  },
];
