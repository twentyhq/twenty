import { WorkflowTriggerType } from '@/workflow/types/Workflow';
import { IconComponent, IconSettingsAutomation } from 'twenty-ui';

export const TRIGGER_TYPES: Array<{
  label: string;
  type: WorkflowTriggerType;
  icon: IconComponent;
}> = [
  {
    label: 'Database Event',
    type: 'DATABASE_EVENT',
    icon: IconSettingsAutomation,
  },
  {
    label: 'Manual',
    type: 'MANUAL',
    icon: IconSettingsAutomation,
  },
];
