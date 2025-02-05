import { WorkflowManualTriggerAvailability } from 'twenty-shared';
import { IconCheckbox, IconComponent, IconSquare } from 'twenty-ui';

export const MANUAL_TRIGGER_AVAILABILITY_OPTIONS: Array<{
  label: string;
  value: WorkflowManualTriggerAvailability;
  Icon: IconComponent;
}> = [
  {
    label: 'When record(s) are selected',
    value: WorkflowManualTriggerAvailability.WHEN_RECORD_SELECTED,
    Icon: IconCheckbox,
  },
  {
    label: 'When no record(s) are selected',
    value: WorkflowManualTriggerAvailability.EVERYWHERE,
    Icon: IconSquare,
  },
];
