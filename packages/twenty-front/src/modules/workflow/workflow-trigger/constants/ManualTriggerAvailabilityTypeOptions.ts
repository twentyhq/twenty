import {
  IconCheckbox,
  type IconComponent,
  IconId,
  IconListDetails,
} from 'twenty-ui/display';

export const MANUAL_TRIGGER_AVAILABILITY_TYPE_OPTIONS: Array<{
  label: string;
  value: 'GLOBAL' | 'SINGLE_RECORD' | 'BULK_RECORDS';
  Icon: IconComponent;
}> = [
  {
    label: 'Global',
    value: 'GLOBAL',
    Icon: IconCheckbox,
  },
  {
    label: 'Single',
    value: 'SINGLE_RECORD',
    Icon: IconId,
  },
  {
    label: 'Bulk',
    value: 'BULK_RECORDS',
    Icon: IconListDetails,
  },
];
