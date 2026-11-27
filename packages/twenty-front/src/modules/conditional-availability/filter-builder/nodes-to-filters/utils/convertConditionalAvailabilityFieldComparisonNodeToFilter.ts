import { convertConditionalAvailabilityNodeToFilterValue } from '@/conditional-availability/filter-builder/nodes-to-filters/utils/convertConditionalAvailabilityNodeToFilterValue';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterOperators';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import {
  type ExpressionComparisonOperator,
  type ExpressionFieldNode,
} from 'twenty-shared/expression';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityFieldComparisonNodeToFilter = ({
  comparisonOperator,
  field,
  valueNode,
}: {
  comparisonOperator: ExpressionComparisonOperator;
  field: ExpressionFieldNode;
  valueNode: ConditionalEvaluationNode;
}): ConditionalAvailabilityFilter | null => {
  const value = convertConditionalAvailabilityNodeToFilterValue({
    node: valueNode,
  });

  const operator = getConditionalAvailabilityFilterOperators({
    filter: { field },
  }).find(
    (candidateOperator) =>
      getConditionalAvailabilityFilterComparisonOperator({
        operator: candidateOperator,
      }) === comparisonOperator,
  );

  if (!isDefined(value) || !isDefined(operator)) {
    return null;
  }

  return { type: 'filter', id: v4(), field, operator, values: [value] };
};
