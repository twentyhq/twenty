import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  type ValidationRuleErrorCode,
  type ValidationRuleErrorParams,
} from 'twenty-shared/types';

export const getValidationRuleErrorMessage = ({
  errorCode,
  errorParams,
  errorMessage,
}: {
  errorCode?: ValidationRuleErrorCode;
  errorParams?: ValidationRuleErrorParams;
  errorMessage: string;
}): string => {
  const argumentCount = errorParams?.argumentCount ?? 0;
  const fieldName = errorParams?.fieldName ?? '';
  const functionName = errorParams?.functionName ?? '';
  const minimumArgumentCount = errorParams?.minimumArgumentCount ?? 0;
  const maxLength = errorParams?.maxLength ?? 0;
  const path = errorParams?.path ?? '';
  const relationFieldName = errorParams?.relationFieldName ?? '';
  const subfieldName = errorParams?.subfieldName ?? '';
  const token = errorParams?.token;

  switch (errorCode) {
    case 'INVALID_DATE_UNIT':
      return t`Invalid date unit. Use MINUTE, HOUR, DAY, WEEK, MONTH, QUARTER or YEAR.`;
    case 'INVALID_DATE_PART':
      return t`Invalid date part. Use YEAR, QUARTER, MONTH, WEEK, DAY, DAY_OF_WEEK, HOUR or MINUTE.`;
    case 'EMPTY_EXPRESSION':
      return t`Expression is empty`;
    case 'EXPRESSION_TOO_LONG':
      return t`Expression is longer than ${maxLength} characters`;
    case 'BRACKET_ACCESS':
      return t`Bracket access is not supported, use dot access instead`;
    case 'SPACED_MEMBER_DOT':
      return t`Write ${path} without spaces around the dot`;
    case 'WRONG_ARGUMENT_COUNT':
      return errorParams?.maximumArgumentCount === minimumArgumentCount
        ? t`${functionName} takes ${minimumArgumentCount} argument(s), but got ${argumentCount}`
        : t`${functionName} takes at least ${minimumArgumentCount} argument(s), but got ${argumentCount}`;
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
    case 'PREVIOUS_VALUE_OF_RELATION':
      return t`"${path}" reads a relation, but previous values only cover this record's own fields`;
    case 'PREVIOUS_VALUE_IN_FORMULA':
      return t`"${path}" reads a previous value, which a formula cannot use`;
    case 'AGGREGATE_NOT_ALLOWED':
      return t`${functionName}() reads related records, which only a formula can do`;
    case 'INVALID_AGGREGATE_ARGUMENT':
      return isNonEmptyString(relationFieldName)
        ? t`The condition of ${functionName}() cannot read "${relationFieldName}"`
        : t`${functionName}() needs a relation, for example count(tasks) or sum(deals.amount)`;
    case 'NESTED_AGGREGATE':
      return t`${functionName}() cannot contain another aggregate`;
    case 'NOT_SUPPORTED_IN_STORED_FORMULA':
      return t`A formula that aggregates related records is stored, so it cannot read "${path}". Aggregate in this field and read it from another formula.`;
    case 'UPDATED_AT_IN_STORED_FORMULA':
      return t`A stored formula cannot read "${path}"`;
    case 'TO_MANY_RELATION_OUTSIDE_AGGREGATE':
      return t`"${fieldName}" has many records: read it inside count(), sum(), avg(), min() or max()`;
    case 'COMPOSITE_FIELD_WITHOUT_PART':
      return t`"${path}" has several parts: read one of them, such as ${path}.${subfieldName}`;
    case 'NON_BOOLEAN_RESULT':
      return t`Expression did not return true or false`;
    case 'INCOMPLETE_EXPRESSION':
      return t`Expression is incomplete`;
    case 'UNCLOSED_TEXT':
      return t`A text value is missing its closing quote`;
    case 'INVALID_SYNTAX':
      return isDefined(token)
        ? t`Unexpected "${token}"`
        : t`Expression is not valid`;
    default:
      return errorMessage;
  }
};
