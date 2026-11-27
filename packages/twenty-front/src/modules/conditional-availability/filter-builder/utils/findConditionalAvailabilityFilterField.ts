import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const findConditionalAvailabilityFilterField = ({
  filterFields,
  filter,
}: {
  filterFields: ConditionalAvailabilityFilterField[];
  filter: ConditionalAvailabilityFilter;
}): ConditionalAvailabilityFilterField | undefined =>
  filterFields.find((filterField) => {
    if ('field' in filter) {
      return (
        'field' in filterField && isDeeplyEqual(filterField.field, filter.field)
      );
    }

    return 'key' in filterField && filterField.key === filter.variable;
  });
