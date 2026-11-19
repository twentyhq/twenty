import { t } from '@lingui/core/macro';
import { type ConditionalAvailabilityCheckError } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityRuleErrorMessage = ({
  ruleError,
}: {
  ruleError: ConditionalAvailabilityCheckError;
}): string => {
  switch (ruleError.errorCode) {
    case 'UNKNOWN_NAME': {
      const { name } = ruleError.errorParams;

      return t`"${name}" is not a variable or function available here`;
    }
    case 'RULE_TOO_LARGE':
    case 'INVALID_NODE':
      return t`The rule cannot be read`;
    default:
      return assertUnreachable(ruleError);
  }
};
