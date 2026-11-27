import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableOperators';
import { type ExpressionFieldNode } from 'twenty-shared/expression';

export const getConditionalAvailabilityFilterOperators = ({
  filter,
}: {
  filter:
    | { variable: ConditionalAvailabilityFilterVariable }
    | { field: ExpressionFieldNode };
}): [
  ConditionalAvailabilityFilterOperator,
  ...ConditionalAvailabilityFilterOperator[],
] => {
  if ('field' in filter) {
    return [
      'is',
      'isNot',
      'isAnyOf',
      'isNoneOf',
      'greaterThanOrEqual',
      'lessThanOrEqual',
    ];
  }

  return getConditionalAvailabilityFilterVariableOperators({
    variable: filter.variable,
  });
};
