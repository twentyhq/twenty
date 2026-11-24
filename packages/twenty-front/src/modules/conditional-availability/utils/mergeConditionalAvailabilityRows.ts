import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowOrGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowOrGroup';
import { getConditionalAvailabilityRowComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityRowComparisonOperator';
import { getConditionalAvailabilityRowOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorValueShape';
import { getConditionalAvailabilitySubjectRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectRowOperators';
import { getConditionalAvailabilityValueListLogicalOperator } from '@/conditional-availability/utils/getConditionalAvailabilityValueListLogicalOperator';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';

export const mergeConditionalAvailabilityRows = ({
  previousRowOrGroup,
  rowOrGroup,
  logicalOperator,
}: {
  previousRowOrGroup: ConditionalAvailabilityRowOrGroup | undefined;
  rowOrGroup: ConditionalAvailabilityRowOrGroup;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityRow | null => {
  if (
    previousRowOrGroup?.type !== 'row' ||
    rowOrGroup.type !== 'row' ||
    previousRowOrGroup.subject !== rowOrGroup.subject
  ) {
    return null;
  }

  const comparisonOperator = getConditionalAvailabilityRowComparisonOperator({
    operator: rowOrGroup.operator,
  });

  const valueListOperator = getConditionalAvailabilitySubjectRowOperators({
    subject: rowOrGroup.subject,
  }).find(
    (operator) =>
      getConditionalAvailabilityRowComparisonOperator({ operator }) ===
        comparisonOperator &&
      getConditionalAvailabilityRowOperatorValueShape({ operator }) === 'list',
  );

  if (
    !isDefined(valueListOperator) ||
    getConditionalAvailabilityRowComparisonOperator({
      operator: previousRowOrGroup.operator,
    }) !== comparisonOperator ||
    getConditionalAvailabilityValueListLogicalOperator({
      comparisonOperator,
    }) !== logicalOperator
  ) {
    return null;
  }

  return {
    ...previousRowOrGroup,
    operator: valueListOperator,
    values: [...previousRowOrGroup.values, ...rowOrGroup.values],
  };
};
