import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariableOperators';
import { v4 } from 'uuid';

export const createEmptyConditionalAvailabilityFilter = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): ConditionalAvailabilityFilter => {
  const [defaultOperator] = getConditionalAvailabilityFilterVariableOperators({
    variable,
  });

  return {
    type: 'filter',
    id: v4(),
    variable,
    operator: defaultOperator,
    values: [],
  };
};
