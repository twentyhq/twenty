import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { v4 } from 'uuid';

export const createEmptyConditionalAvailabilityFilter = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): ConditionalAvailabilityFilter => ({
  type: 'filter',
  id: v4(),
  variable,
  operator: 'EQUAL',
  values: [],
});
