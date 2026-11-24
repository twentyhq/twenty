import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';

export const updateConditionalAvailabilityRowGroup = ({
  rowGroup,
  groupId,
  update,
}: {
  rowGroup: ConditionalAvailabilityRowGroup;
  groupId: string;
  update: (
    rowGroup: ConditionalAvailabilityRowGroup,
  ) => ConditionalAvailabilityRowGroup;
}): ConditionalAvailabilityRowGroup => {
  if (rowGroup.id === groupId) {
    return update(rowGroup);
  }

  return {
    ...rowGroup,
    children: rowGroup.children.map((child) =>
      child.type === 'group'
        ? updateConditionalAvailabilityRowGroup({
            rowGroup: child,
            groupId,
            update,
          })
        : child,
    ),
  };
};
