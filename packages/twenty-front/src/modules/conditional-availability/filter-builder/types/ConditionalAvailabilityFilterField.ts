import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { type MessageDescriptor } from '@lingui/core';
import { type ExpressionFieldNode } from 'twenty-shared/expression';
import { type IconComponent } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

export type ConditionalAvailabilityFilterField = {
  Icon: IconComponent;
  options: SelectOption<string>[];
} & (
  | { key: ConditionalAvailabilityFilterVariable; label: MessageDescriptor }
  | {
      key: string;
      field: ExpressionFieldNode;
      label: string;
      objectLabelSingular: string;
    }
);
