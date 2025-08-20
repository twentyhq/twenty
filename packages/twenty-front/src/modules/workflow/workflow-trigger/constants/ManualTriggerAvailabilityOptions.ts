import { type WorkflowManualTriggerAvailability } from '@/workflow/types/Workflow';
import {
  IconCheckbox,
  type IconComponent,
  IconSquare,
} from 'twenty-ui/display';

export const MANUAL_TRIGGER_AVAILABILITY_OPTIONS: Array<{
  label: string;
  value: WorkflowManualTriggerAvailability;
  Icon: IconComponent;
}> = [
  {
    label: 'When records are selected',
    value: 'WHEN_RECORD_SELECTED',
    Icon: IconCheckbox,
  },
  {
    label: 'When no records are selected',
    value: 'EVERYWHERE',
    Icon: IconSquare,
  },
];
