import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCheckbox,
  type IconComponent,
  IconId,
  IconListDetails,
} from 'twenty-ui/icon';

export const MANUAL_TRIGGER_AVAILABILITY_TYPE_OPTIONS: Array<{
  label: MessageDescriptor;
  value: 'GLOBAL' | 'SINGLE_RECORD' | 'BULK_RECORDS';
  Icon: IconComponent;
}> = [
  {
    label: msg`Global`,
    value: 'GLOBAL',
    Icon: IconCheckbox,
  },
  {
    label: msg`Single`,
    value: 'SINGLE_RECORD',
    Icon: IconId,
  },
  {
    label: msg`Bulk`,
    value: 'BULK_RECORDS',
    Icon: IconListDetails,
  },
];
