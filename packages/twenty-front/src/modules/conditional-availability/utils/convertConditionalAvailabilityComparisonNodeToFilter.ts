import { CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/constants/ConditionalAvailabilityFilterVariables';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariablePath';
import { isConditionalAvailabilityFilterValueValid } from '@/conditional-availability/utils/isConditionalAvailabilityFilterValueValid';
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

  const { operator, left: variableNode, right: literalNode } = node;

  if (
    variableNode.type !== 'VARIABLE' ||
    literalNode.type !== 'LITERAL' ||
    !isString(literalNode.value)
  ) {
    return null;
  }

  if (operator !== 'EQUAL' && operator !== 'NOT_EQUAL') {
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

  return { type: 'filter', id: v4(), variable, operator, values: [value] };
};
