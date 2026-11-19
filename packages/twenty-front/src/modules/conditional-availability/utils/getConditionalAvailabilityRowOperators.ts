import { CONDITIONAL_AVAILABILITY_OPERATORS_BY_FIELD_KIND } from '@/conditional-availability/constants/ConditionalAvailabilityOperatorsByFieldKind';
import { CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectOperators';
import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';

export const getConditionalAvailabilityRowOperators = ({
  rowSubject,
}: {
  rowSubject: ConditionalAvailabilityRowSubject;
}): ConditionalAvailabilityOperator[] => {
  if (rowSubject.subject !== 'recordField') {
    return CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS[rowSubject.subject];
  }

  const operators =
    CONDITIONAL_AVAILABILITY_OPERATORS_BY_FIELD_KIND[rowSubject.fieldKind];

  return rowSubject.fieldKind === 'text' && rowSubject.subFieldName !== null
    ? operators.filter((operator) => operator !== 'is' && operator !== 'isNot')
    : operators;
};
