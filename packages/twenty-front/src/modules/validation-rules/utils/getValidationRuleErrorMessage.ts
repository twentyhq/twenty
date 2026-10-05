import { t } from '@lingui/core/macro';
import { type ValidationRuleErrorCode } from 'twenty-shared/types';

// Errors without a code keep the English message from twenty-shared
export const getValidationRuleErrorMessage = ({
  errorCode,
  errorMessage,
}: {
  errorCode?: ValidationRuleErrorCode;
  errorMessage: string;
}): string => {
  switch (errorCode) {
    case 'BRACKET_ACCESS':
      return t`Bracket access is not supported, use dot access instead`;
    case 'NON_BOOLEAN_RESULT':
      return t`Expression did not return true or false`;
    default:
      return errorMessage;
  }
};
