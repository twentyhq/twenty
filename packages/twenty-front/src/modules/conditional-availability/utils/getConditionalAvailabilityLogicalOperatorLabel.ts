import { t } from '@lingui/core/macro';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityLogicalOperatorLabel = ({
  logicalOperator,
}: {
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): string => {
  switch (logicalOperator) {
    case 'AND':
      return t`And`;
    case 'OR':
      return t`Or`;
    default:
      return assertUnreachable(logicalOperator);
  }
};
