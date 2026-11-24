import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { getConditionalAvailabilityRowOperatorComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorComparisonOperator';
import { getConditionalAvailabilityRowOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorValueShape';
import { getConditionalAvailabilitySubjectRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectRowOperators';
import { getConditionalAvailabilityValueListLogicalOperator } from '@/conditional-availability/utils/getConditionalAvailabilityValueListLogicalOperator';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';

export const mergeConditionalAvailabilityRowTreeChildren = ({
  previousChild,
  child,
  logicalOperator,
}: {
  previousChild: ConditionalAvailabilityRowTreeChild | undefined;
  child: ConditionalAvailabilityRowTreeChild;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityRow | null => {
  if (
    previousChild?.type !== 'row' ||
    child.type !== 'row' ||
    previousChild.subject !== child.subject
  ) {
    return null;
  }

  const comparisonOperator =
    getConditionalAvailabilityRowOperatorComparisonOperator({
      operator: child.operator,
    });

  const valueListOperator = getConditionalAvailabilitySubjectRowOperators({
    subject: child.subject,
  }).find(
    (operator) =>
      getConditionalAvailabilityRowOperatorComparisonOperator({ operator }) ===
        comparisonOperator &&
      getConditionalAvailabilityRowOperatorValueShape({ operator }) === 'list',
  );

  if (
    !isDefined(valueListOperator) ||
    getConditionalAvailabilityRowOperatorComparisonOperator({
      operator: previousChild.operator,
    }) !== comparisonOperator ||
    getConditionalAvailabilityValueListLogicalOperator({
      comparisonOperator,
    }) !== logicalOperator
  ) {
    return null;
  }

  return {
    ...previousChild,
    operator: valueListOperator,
    values: [...previousChild.values, ...child.values],
  };
};
