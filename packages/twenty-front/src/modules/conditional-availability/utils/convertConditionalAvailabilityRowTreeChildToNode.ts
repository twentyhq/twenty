import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { getConditionalAvailabilityRowOperatorComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorComparisonOperator';
import { getConditionalAvailabilitySubjectVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectVariablePath';
import { getConditionalAvailabilityValueListLogicalOperator } from '@/conditional-availability/utils/getConditionalAvailabilityValueListLogicalOperator';
import {
  type ConditionalAvailabilityNode,
  joinConditionalAvailabilityNodes,
} from 'twenty-shared/conditional-availability';

export const convertConditionalAvailabilityRowTreeChildToNode = ({
  child,
}: {
  child: ConditionalAvailabilityRowTreeChild;
}): ConditionalAvailabilityNode => {
  if (child.type === 'group') {
    return joinConditionalAvailabilityNodes({
      nodes: child.children.map((groupChild) =>
        convertConditionalAvailabilityRowTreeChildToNode({ child: groupChild }),
      ),
      logicalOperator: child.logicalOperator,
    });
  }

  const comparisonOperator =
    getConditionalAvailabilityRowOperatorComparisonOperator({
      operator: child.operator,
    });
  const variablePath = getConditionalAvailabilitySubjectVariablePath({
    subject: child.subject,
  });

  return joinConditionalAvailabilityNodes({
    nodes: child.values.map((value) => ({
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
