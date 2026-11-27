import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { createEmptyConditionalAvailabilityFilterOnField } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilterOnField';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterOperators';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariablePath';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import {
  type ExpressionComparisonNode,
  type ExpressionFieldNode,
} from 'twenty-shared/expression';
import { isDefined } from 'twenty-shared/utils';

const getFilterValue = (
  valueNode: ConditionalEvaluationNode,
): string | null => {
  if (valueNode.type === 'LITERAL' && isNonEmptyString(valueNode.value)) {
    return valueNode.value;
  }

  const isCurrentWorkspaceMember =
    valueNode.type === 'VARIABLE' &&
    valueNode.path ===
      getConditionalAvailabilityFilterVariablePath({
        variable: 'currentWorkspaceMember',
      });

  return isCurrentWorkspaceMember
    ? CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID
    : null;
};

export const convertConditionalAvailabilityFieldComparisonNodeToFilter = ({
  comparisonOperator,
  field,
  valueNode,
}: {
  comparisonOperator: ExpressionComparisonNode<ConditionalEvaluationNode>['operator'];
  field: ExpressionFieldNode;
  valueNode: ConditionalEvaluationNode;
}): ConditionalAvailabilityFilter | null => {
  const value = getFilterValue(valueNode);
  const emptyFilter = createEmptyConditionalAvailabilityFilterOnField({
    field,
  });

  const operator = getConditionalAvailabilityFilterOperators({
    filter: emptyFilter,
  }).find(
    (candidateOperator) =>
      getConditionalAvailabilityFilterComparisonOperator({
        operator: candidateOperator,
      }) === comparisonOperator,
  );

  if (!isDefined(value) || !isDefined(operator)) {
    return null;
  }

  return { ...emptyFilter, operator, values: [value] };
};
