import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';

export const updateConditionalAvailabilityFilter = ({
  filterGroup,
  filterId,
  update,
}: {
  filterGroup: ConditionalAvailabilityFilterGroup;
  filterId: string;
  update: (
    filter: ConditionalAvailabilityFilter,
  ) => ConditionalAvailabilityFilter;
}): ConditionalAvailabilityFilterGroup => ({
  ...filterGroup,
  children: filterGroup.children.map((child) => {
    if (child.type === 'filterGroup') {
      return updateConditionalAvailabilityFilter({
        filterGroup: child,
        filterId,
        update,
      });
    }

    return child.id === filterId ? update(child) : child;
  }),
});
