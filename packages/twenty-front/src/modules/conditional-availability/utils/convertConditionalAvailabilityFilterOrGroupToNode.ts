import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariablePath';
import { getConditionalAvailabilityValueListLogicalOperator } from '@/conditional-availability/utils/getConditionalAvailabilityValueListLogicalOperator';
import {
  type ConditionalAvailabilityNode,
  joinConditionalAvailabilityNodes,
} from 'twenty-shared/conditional-availability';

export const convertConditionalAvailabilityFilterOrGroupToNode = ({
  filterOrGroup,
}: {
  filterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup;
}): ConditionalAvailabilityNode => {
  if (filterOrGroup.type === 'filterGroup') {
    return joinConditionalAvailabilityNodes({
      nodes: filterOrGroup.children.map((child) =>
        convertConditionalAvailabilityFilterOrGroupToNode({
          filterOrGroup: child,
        }),
      ),
      logicalOperator: filterOrGroup.logicalOperator,
    });
  }

  const comparisonOperator = getConditionalAvailabilityFilterComparisonOperator(
    {
      operator: filterOrGroup.operator,
    },
  );
  const variablePath = getConditionalAvailabilityFilterVariablePath({
    variable: filterOrGroup.variable,
  });

  return joinConditionalAvailabilityNodes({
    nodes: filterOrGroup.values.map((value) => ({
      type: 'COMPARISON',
      operator: comparisonOperator,
      left: { type: 'VARIABLE', path: variablePath },
      right: { type: 'LITERAL', value },
    })),
    logicalOperator: getConditionalAvailabilityValueListLogicalOperator({
      comparisonOperator,
    }),
  });
};
