import { t } from '@lingui/core/macro';
import {
  type ValidationRuleErrorCode,
  type ValidationRuleErrorParams,
} from 'twenty-shared/types';

// Errors without a code are opaque parser messages, so they keep the English text from twenty-shared
export const getValidationRuleErrorMessage = ({
  errorCode,
  errorParams,
  errorMessage,
}: {
  errorCode?: ValidationRuleErrorCode;
  errorParams?: ValidationRuleErrorParams;
  errorMessage: string;
}): string => {
  const fieldName = errorParams?.fieldName ?? '';
  const maxLength = errorParams?.maxLength ?? 0;
  const path = errorParams?.path ?? '';
  const relationFieldName = errorParams?.relationFieldName ?? '';
  const subfieldName = errorParams?.subfieldName ?? '';

  switch (errorCode) {
    case 'EMPTY_EXPRESSION':
      return t`Expression is empty`;
    case 'EXPRESSION_TOO_LONG':
      return t`Expression is longer than ${maxLength} characters`;
    case 'BRACKET_ACCESS':
      return t`Bracket access is not supported, use dot access instead`;
    case 'SPACED_MEMBER_DOT':
      return t`Write ${path} without spaces around the dot`;
    case 'NOT_A_VALUE':
      return t`"${path}" is not a value`;
    case 'UNKNOWN_FIELD':
      return t`Unknown field "${fieldName}"`;
    case 'UNKNOWN_SUBFIELD':
      return t`"${subfieldName}" is not a subfield of "${fieldName}"`;
    case 'SUBFIELD_TOO_DEEP':
      return t`"${path}" goes deeper than the field "${fieldName}" allows`;
    case 'NOT_A_TO_ONE_RELATION':
      return t`"${fieldName}" is not a to-one relation`;
    case 'UNKNOWN_RELATION_TARGET_FIELD':
      return t`Unknown field "${fieldName}" on "${relationFieldName}"`;
    case 'RELATION_TOO_DEEP':
      return t`"${path}" goes more than one relation deep`;
    case 'NON_BOOLEAN_RESULT':
      return t`Expression did not return true or false`;
    default:
      return errorMessage;
  }
};
