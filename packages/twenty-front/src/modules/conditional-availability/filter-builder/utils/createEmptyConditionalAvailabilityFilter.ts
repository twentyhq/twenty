import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { getConditionalAvailabilityFilterOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterOperators';
import { type ExpressionFieldNode } from 'twenty-shared/expression';
import { v4 } from 'uuid';

export const createEmptyConditionalAvailabilityFilter = (
  variableOrField:
    | { variable: ConditionalAvailabilityFilterVariable }
    | { field: ExpressionFieldNode },
): ConditionalAvailabilityFilter => {
  const [defaultOperator] = getConditionalAvailabilityFilterOperators({
    filter: variableOrField,
  });

  return {
    type: 'filter',
    id: v4(),
    ...variableOrField,
    operator: defaultOperator,
    values: [],
  };
};
