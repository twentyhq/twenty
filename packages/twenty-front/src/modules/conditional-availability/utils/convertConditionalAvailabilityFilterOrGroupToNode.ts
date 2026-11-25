import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariablePath';
import {
  type ConditionalAvailabilityNode,
  joinConditionalAvailabilityNodes,
} from 'twenty-shared/conditional-availability';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const convertConditionalAvailabilityFilterOrGroupToNode = ({
  filterOrGroup,
}: {
  filterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup;
}): ConditionalAvailabilityNode | null => {
  if (filterOrGroup.type === 'filterGroup') {
    const childNodes = filterOrGroup.children
      .map((child) =>
        convertConditionalAvailabilityFilterOrGroupToNode({
          filterOrGroup: child,
        }),
      )
      .filter(isDefined);

    return isNonEmptyArray(childNodes)
      ? joinConditionalAvailabilityNodes({
          nodes: childNodes,
          logicalOperator: filterOrGroup.logicalOperator,
        })
      : null;
  }

  const { variable, operator, values } = filterOrGroup;

  if (!isNonEmptyArray(values)) {
    return null;
  }

  const variablePath = getConditionalAvailabilityFilterVariablePath({
    variable,
  });

  return joinConditionalAvailabilityNodes({
    nodes: values.map((value) => ({
      type: 'COMPARISON',
      operator,
      left: { type: 'VARIABLE', path: variablePath },
      right: { type: 'LITERAL', value },
    })),
    logicalOperator: operator === 'EQUAL' ? 'OR' : 'AND',
  });
};
