import { CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/constants/ConditionalAvailabilityFilterVariables';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariableOperators';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariablePath';
import { isString } from '@sniptt/guards';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityComparisonNodeToFilter = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): ConditionalAvailabilityFilter | null => {
  if (node.type !== 'COMPARISON') {
    return null;
  }

  const { operator: comparisonOperator, left: variable, right: text } = node;

  if (
    variable.type !== 'VARIABLE' ||
    text.type !== 'LITERAL' ||
    !isString(text.value)
  ) {
    return null;
  }

  const filterVariable = CONDITIONAL_AVAILABILITY_FILTER_VARIABLES.find(
    (candidateVariable) =>
      getConditionalAvailabilityFilterVariablePath({
        variable: candidateVariable,
      }) === variable.path,
  );

  if (!isDefined(filterVariable)) {
    return null;
  }

  const operator = getConditionalAvailabilityFilterVariableOperators({
    variable: filterVariable,
  }).find(
    (candidateOperator) =>
      getConditionalAvailabilityFilterComparisonOperator({
        operator: candidateOperator,
      }) === comparisonOperator,
  );

  if (!isDefined(operator)) {
    return null;
  }

  return {
    type: 'filter',
    id: v4(),
    variable: filterVariable,
    operator,
    values: [text.value],
  };
};
