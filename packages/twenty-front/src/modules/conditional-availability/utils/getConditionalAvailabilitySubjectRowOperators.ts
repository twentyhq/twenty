import { type ConditionalAvailabilityRowOperator } from '@/conditional-availability/types/ConditionalAvailabilityRowOperator';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilitySubjectRowOperators = ({
  subject,
}: {
  subject: ConditionalAvailabilitySubject;
}): [
  ConditionalAvailabilityRowOperator,
  ...ConditionalAvailabilityRowOperator[],
] => {
  switch (subject) {
    case 'role':
      return ['isAnyOf', 'isNoneOf'];
    case 'workspaceMember':
      return ['is', 'isNot', 'isAnyOf', 'isNoneOf'];
    case 'device':
      return ['is'];
    default:
      return assertUnreachable(subject);
  }
};
