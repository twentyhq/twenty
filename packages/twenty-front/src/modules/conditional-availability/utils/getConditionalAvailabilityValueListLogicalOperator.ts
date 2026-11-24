import {
  type ConditionalAvailabilityComparisonOperator,
  type ConditionalAvailabilityLogicalOperator,
} from 'twenty-shared/conditional-availability';
import { doNotTranslate } from 'twenty-shared/i18n';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityValueListLogicalOperator = ({
  comparisonOperator,
}: {
  comparisonOperator: Extract<
    ConditionalAvailabilityComparisonOperator,
    'EQUAL' | 'NOT_EQUAL'
  >;
}): ConditionalAvailabilityLogicalOperator => {
  switch (comparisonOperator) {
    case 'EQUAL':
      return doNotTranslate('OR');
    case 'NOT_EQUAL':
      return doNotTranslate('AND');
    default:
      return assertUnreachable(comparisonOperator);
  }
};
