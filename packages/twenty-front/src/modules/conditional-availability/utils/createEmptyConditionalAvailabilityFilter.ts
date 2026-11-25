import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariableOperators';

export const createEmptyConditionalAvailabilityFilter = ({
  id,
  variable,
}: {
  id: string;
  variable: ConditionalAvailabilityFilterVariable;
}): ConditionalAvailabilityFilter => {
  const [defaultOperator] = getConditionalAvailabilityFilterVariableOperators({
    variable,
  });

  return {
    type: 'filter',
    id,
    variable,
    operator: defaultOperator,
    values: [],
  };
};
