import { CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/constants/ConditionalAvailabilityFilterVariables';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariableOperators';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariablePath';
import { isConditionalAvailabilityFilterValueValid } from '@/conditional-availability/utils/isConditionalAvailabilityFilterValueValid';
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
