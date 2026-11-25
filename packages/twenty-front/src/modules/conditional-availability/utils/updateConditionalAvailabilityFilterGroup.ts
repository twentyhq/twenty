import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';

export const updateConditionalAvailabilityFilterGroup = ({
  filterGroup,
  filterGroupId,
  update,
}: {
  filterGroup: ConditionalAvailabilityFilterGroup;
  filterGroupId: string;
  update: (
    filterGroup: ConditionalAvailabilityFilterGroup,
  ) => ConditionalAvailabilityFilterGroup;
}): ConditionalAvailabilityFilterGroup => {
  if (filterGroup.id === filterGroupId) {
    return update(filterGroup);
  }

  return {
    ...filterGroup,
    children: filterGroup.children.map((child) =>
      child.type === 'filterGroup'
        ? updateConditionalAvailabilityFilterGroup({
            filterGroup: child,
            filterGroupId,
            update,
          })
        : child,
    ),
  };
};
