import { type ConditionalAvailabilityRowOrGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowOrGroup';
import { getConditionalAvailabilityRowComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityRowComparisonOperator';
import { getConditionalAvailabilitySubjectVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectVariablePath';
import { getConditionalAvailabilityValueListLogicalOperator } from '@/conditional-availability/utils/getConditionalAvailabilityValueListLogicalOperator';
import {
  type ConditionalAvailabilityNode,
  joinConditionalAvailabilityNodes,
} from 'twenty-shared/conditional-availability';

export const convertConditionalAvailabilityRowOrGroupToNode = ({
  rowOrGroup,
}: {
  rowOrGroup: ConditionalAvailabilityRowOrGroup;
}): ConditionalAvailabilityNode => {
  if (rowOrGroup.type === 'group') {
    return joinConditionalAvailabilityNodes({
      nodes: rowOrGroup.children.map((child) =>
        convertConditionalAvailabilityRowOrGroupToNode({ rowOrGroup: child }),
      ),
      logicalOperator: rowOrGroup.logicalOperator,
    });
  }

  const comparisonOperator = getConditionalAvailabilityRowComparisonOperator({
    operator: rowOrGroup.operator,
  });
  const variablePath = getConditionalAvailabilitySubjectVariablePath({
    subject: rowOrGroup.subject,
  });

  return joinConditionalAvailabilityNodes({
    nodes: rowOrGroup.values.map((value) => ({
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
