import { isConditionalDisplaySelectedRecordPathValueEmpty } from '@/conditional-display/utils/isConditionalDisplaySelectedRecordPathValueEmpty';
import { isArray, isNonEmptyString, isNumber } from '@sniptt/guards';
import {
  type ConditionalDisplayRecordFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isEmptinessOperand,
  parseJson,
  safeGetNestedProperty,
} from 'twenty-shared/utils';

export const isConditionalDisplaySelectedRecordPathMatching = ({
  recordFilter: { operand, subFieldName, value },
  record,
}: {
  recordFilter: ConditionalDisplayRecordFilter;
  record: unknown;
}): boolean => {
  if (!isDefined(record) || !isNonEmptyString(subFieldName)) {
    return false;
  }

  const subject = safeGetNestedProperty(record, subFieldName);

  if (isEmptinessOperand(operand)) {
    return operand === ViewFilterOperand.IS_EMPTY
      ? isConditionalDisplaySelectedRecordPathValueEmpty(subject)
      : !isConditionalDisplaySelectedRecordPathValueEmpty(subject);
  }

  const literal = parseJson<unknown>(value);

  if (!isDefined(literal)) {
    return false;
  }

  switch (operand) {
    case ViewFilterOperand.IS:
      return subject === literal;
    case ViewFilterOperand.IS_NOT:
      return subject !== literal;
    case ViewFilterOperand.CONTAINS:
      return isArray(subject) && subject.includes(literal);
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return isArray(subject) && !subject.includes(literal);
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return isNumber(subject) && isNumber(literal) && subject >= literal;
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return isNumber(subject) && isNumber(literal) && subject <= literal;
    default:
      return false;
  }
};
