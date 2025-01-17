import { WorkflowTriggerType } from '@/workflow/types/Workflow';
import { DatabaseTriggerName } from '@/workflow/workflow-trigger/constants/DatabaseTriggerName';
import { IconClick, IconComponent, IconPlus, IconTrash } from 'twenty-ui';

export const DATABASE_TRIGGER_TYPES: Array<{
  name: DatabaseTriggerName;
  type: WorkflowTriggerType;
  icon: IconComponent;
}> = [
  {
    name: DatabaseTriggerName.RECORD_IS_CREATED,
    type: 'DATABASE_EVENT',
    icon: IconPlus,
  },
  {
    name: DatabaseTriggerName.RECORD_IS_UPDATED,
    type: 'DATABASE_EVENT',
    icon: IconClick,
  },
  {
    name: DatabaseTriggerName.RECORD_IS_DELETED,
    type: 'DATABASE_EVENT',
    icon: IconTrash,
  },
];
