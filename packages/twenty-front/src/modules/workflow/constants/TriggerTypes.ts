import { WorkflowTriggerType } from '@/workflow/types/Workflow';
import { IconComponent, IconSettingsAutomation } from 'twenty-ui';

export const TRIGGER_TYPES: Array<{
  name: string;
  type: WorkflowTriggerType;
  icon: IconComponent;
}> = [
  {
    name: 'Database Event',
    type: 'DATABASE_EVENT',
    icon: IconSettingsAutomation,
  },
  {
    name: 'Manual',
    type: 'MANUAL',
    icon: IconSettingsAutomation,
  },
];
