import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';

export const updateConditionalAvailabilityRow = ({
  rowGroup,
  rowId,
  update,
}: {
  rowGroup: ConditionalAvailabilityRowGroup;
  rowId: string;
  update: (row: ConditionalAvailabilityRow) => ConditionalAvailabilityRow;
}): ConditionalAvailabilityRowGroup => ({
  ...rowGroup,
  children: rowGroup.children.map((child) => {
    if (child.type === 'group') {
      return updateConditionalAvailabilityRow({
        rowGroup: child,
        rowId,
        update,
      });
    }

    return child.id === rowId ? update(child) : child;
  }),
});
