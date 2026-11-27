import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariablePath';
import {
  type ExpressionFieldNode,
  type ExpressionVariableNode,
} from 'twenty-shared/expression';

export const getConditionalAvailabilityFilterLeftNode = ({
  filter,
}: {
  filter: ConditionalAvailabilityFilter;
}): ExpressionFieldNode | ExpressionVariableNode => {
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
