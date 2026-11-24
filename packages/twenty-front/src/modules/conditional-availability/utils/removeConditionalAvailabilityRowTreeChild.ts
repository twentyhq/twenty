import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const removeConditionalAvailabilityRowTreeChild = ({
  rowGroup,
  childId,
}: {
  rowGroup: ConditionalAvailabilityRowGroup;
  childId: string;
}): ConditionalAvailabilityRowGroup => ({
  ...rowGroup,
  children: rowGroup.children
    .filter((child) => child.id !== childId)
    .map((child) =>
      child.type === 'group'
        ? removeConditionalAvailabilityRowTreeChild({
            rowGroup: child,
            childId,
          })
        : child,
    )
    .filter((child) => child.type === 'row' || isNonEmptyArray(child.children)),
});
