import { t } from '@lingui/core/macro';
import { type ConditionalEvaluationLogicalOperator } from 'twenty-shared/conditional-evaluation';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityLogicalOperatorLabel = ({
  logicalOperator,
}: {
  logicalOperator: ConditionalEvaluationLogicalOperator;
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
