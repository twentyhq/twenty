import { FieldNumberVariant } from '@/object-record/record-field/types/FieldMetadata';
import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { Icon, IconLetterK, IconProps } from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { IconNumber9, IconPercentage } from 'twenty-ui/display';

type NumberDataModelSelectOptions = {
  Icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  label: MessageDescriptor;
  value: FieldNumberVariant;
}
export const NUMBER_DATA_MODEL_SELECT_OPTIONS = [
  {
    Icon: IconNumber9,
    label: msg`Number`,
    value: 'number',
  },
  {
    Icon: IconLetterK,
    label: msg`Short`,
    value: 'shortNumber',
  },
  {
    Icon: IconPercentage,
    label: msg`Percentage`,
    value: 'percentage',
  },
] as const satisfies Array<NumberDataModelSelectOptions>;
