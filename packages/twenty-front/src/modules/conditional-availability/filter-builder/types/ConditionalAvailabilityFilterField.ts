import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

export type ConditionalAvailabilityFilterField = {
  key: ConditionalAvailabilityFilterVariable;
  label: MessageDescriptor;
  Icon: IconComponent;
  options: SelectOption<string>[];
};
