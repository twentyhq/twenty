import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { doNotTranslate } from 'twenty-shared/i18n';

export const addConditionalAvailabilityRowGroup = ({
  tree,
  groupId,
  row,
}: {
  tree: ConditionalAvailabilityRowTree;
  groupId: string;
  row: ConditionalAvailabilityRow;
}): ConditionalAvailabilityRowTree => ({
  ...tree,
  children: [
    ...tree.children,
    {
      type: 'group',
      group: {
        id: groupId,
        logicalOperator: doNotTranslate('AND'),
        rows: [row],
      },
    },
  ],
});
