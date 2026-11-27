import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariablePath';
import {
  type ExpressionFieldNode,
  type ExpressionVariableNode,
} from 'twenty-shared/expression';

export const getConditionalAvailabilityFilterVariableOrFieldNode = ({
  filter,
}: {
  filter:
    | { variable: ConditionalAvailabilityFilterVariable }
    | { field: ExpressionFieldNode };
}): ExpressionVariableNode | ExpressionFieldNode => {
  if ('field' in filter) {
    return filter.field;
  }

  return {
    type: 'VARIABLE',
    path: getConditionalAvailabilityFilterVariablePath({
      variable: filter.variable,
    }),
  };
};
