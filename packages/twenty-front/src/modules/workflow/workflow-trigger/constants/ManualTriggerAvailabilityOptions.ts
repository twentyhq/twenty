import { WorkflowManualTriggerAvailability } from '@/workflow/types/Workflow';
import { IconCheckbox, IconComponent, IconSquare } from 'twenty-ui/display';

export const MANUAL_TRIGGER_AVAILABILITY_OPTIONS: Array<{
  label: string;
  value: WorkflowManualTriggerAvailability;
  Icon: IconComponent;
}> = [
  {
    label: 'When record is selected',
    value: 'WHEN_RECORD_SELECTED',
    Icon: IconCheckbox,
  },
  {
    label: 'When no record is selected',
    value: 'EVERYWHERE',
    Icon: IconSquare,
  },
];
