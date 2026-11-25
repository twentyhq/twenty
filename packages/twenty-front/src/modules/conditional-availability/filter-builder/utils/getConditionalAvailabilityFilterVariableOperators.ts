import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { assertUnreachable } from 'twenty-shared/utils';

export const getConditionalAvailabilityFilterVariableOperators = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): [
  ConditionalAvailabilityFilterOperator,
  ...ConditionalAvailabilityFilterOperator[],
] => {
  switch (variable) {
    case 'currentRole':
      return ['isAnyOf', 'isNoneOf'];
    case 'currentWorkspaceMember':
      return ['is', 'isNot', 'isAnyOf', 'isNoneOf'];
    case 'device':
      return ['is'];
    default:
      return assertUnreachable(variable);
  }
};
