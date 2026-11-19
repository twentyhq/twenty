import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';

export const updateConditionalAvailabilityRow = ({
  tree,
  rowId,
  update,
}: {
  tree: ConditionalAvailabilityRowTree;
  rowId: string;
  update: (row: ConditionalAvailabilityRow) => ConditionalAvailabilityRow;
}): ConditionalAvailabilityRowTree => {
  const updateRow = (row: ConditionalAvailabilityRow) =>
    row.id === rowId ? update(row) : row;

  return {
    ...tree,
    children: tree.children.map((child): ConditionalAvailabilityRowTreeChild =>
      child.type === 'row'
        ? { type: 'row', row: updateRow(child.row) }
        : {
            type: 'group',
            group: { ...child.group, rows: child.group.rows.map(updateRow) },
          },
    ),
  };
};
