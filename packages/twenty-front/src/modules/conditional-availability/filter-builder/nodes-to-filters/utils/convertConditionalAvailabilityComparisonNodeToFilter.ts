import { CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/filter-builder/constants/ConditionalAvailabilityFilterVariables';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableOperators';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariablePath';
import { convertConditionalAvailabilityFieldComparisonNodeToFilter } from '@/conditional-availability/filter-builder/nodes-to-filters/utils/convertConditionalAvailabilityFieldComparisonNodeToFilter';
import { isConditionalAvailabilityFilterValueValid } from '@/conditional-availability/filter-builder/nodes-to-filters/utils/isConditionalAvailabilityFilterValueValid';
import { isString } from '@sniptt/guards';
import { type ConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityComparisonNodeToFilter = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): ConditionalAvailabilityFilter | null => {
  if (node.type !== 'COMPARISON') {
    return null;
  }

  const {
    operator: comparisonOperator,
    left: variableNode,
    right: literalNode,
  } = node;

  if (variableNode.type === 'FIELD') {
    return convertConditionalAvailabilityFieldComparisonNodeToFilter({
      comparisonOperator,
      field: variableNode,
      valueNode: literalNode,
    });
  }

  if (
    variableNode.type !== 'VARIABLE' ||
    literalNode.type !== 'LITERAL' ||
    !isString(literalNode.value)
  ) {
    return null;
  }

  const { value } = literalNode;

  const variable = CONDITIONAL_AVAILABILITY_FILTER_VARIABLES.find(
    (candidateVariable) =>
      getConditionalAvailabilityFilterVariablePath({
        variable: candidateVariable,
      }) === variableNode.path,
  );

  if (
    !isDefined(variable) ||
    !isConditionalAvailabilityFilterValueValid({ variable, value })
  ) {
    return null;
  }

  const operator = getConditionalAvailabilityFilterVariableOperators({
    variable,
  }).find(
    (candidateOperator) =>
      getConditionalAvailabilityFilterComparisonOperator({
        operator: candidateOperator,
      }) === comparisonOperator,
  );

  if (!isDefined(operator)) {
    return null;
  }

  return { type: 'filter', id: v4(), variable, operator, values: [value] };
};
