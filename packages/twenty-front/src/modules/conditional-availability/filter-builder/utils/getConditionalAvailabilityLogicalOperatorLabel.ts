import { t } from '@lingui/core/macro';
import { type ExpressionLogicalOperator } from 'twenty-shared/expression';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityLogicalOperatorLabel = ({
  logicalOperator,
}: {
  logicalOperator: ExpressionLogicalOperator;
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
