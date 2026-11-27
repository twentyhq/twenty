import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ExpressionFieldNode } from 'twenty-shared/expression';
import { v4 } from 'uuid';

export const createEmptyConditionalAvailabilityFilterOnField = ({
  field,
}: {
  field: ExpressionFieldNode;
}): ConditionalAvailabilityFilter => ({
  type: 'filter',
  id: v4(),
  field,
  operator: 'is',
  values: [],
});
