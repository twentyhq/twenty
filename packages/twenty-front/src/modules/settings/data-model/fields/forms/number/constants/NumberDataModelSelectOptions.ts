import { type FieldNumberVariant } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ForwardRefExoticComponent, type RefAttributes } from 'react';
import {
  IconLetterK,
  IconNumber9,
  IconPercentage,
  type IconComponent,
  type IconComponentProps,
} from 'twenty-ui/display';

type NumberDataModelSelectOptions = {
  Icon: ForwardRefExoticComponent<
    IconComponentProps & RefAttributes<IconComponent>
  >;
  label: MessageDescriptor;
  value: FieldNumberVariant;
};
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
