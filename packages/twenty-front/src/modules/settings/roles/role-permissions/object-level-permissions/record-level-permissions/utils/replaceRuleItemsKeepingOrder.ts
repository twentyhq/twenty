/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

export const replaceRuleItemsKeepingOrder = <TItem extends { id: string }>({
  previousItems,
  nextRuleItems,
  isRuleItem,
}: {
  previousItems: TItem[];
  nextRuleItems: TItem[];
  isRuleItem: (item: TItem) => boolean;
}): TItem[] => {
  const nextRuleItemById = new Map(
    nextRuleItems.map((item) => [item.id, item]),
  );
  const previousItemIds = new Set(previousItems.map(({ id }) => id));

  return [
    ...previousItems.flatMap((item) => {
      if (!isRuleItem(item)) {
        return [item];
      }

      const nextRuleItem = nextRuleItemById.get(item.id);

      return isDefined(nextRuleItem) ? [nextRuleItem] : [];
    }),
    ...nextRuleItems.filter(({ id }) => !previousItemIds.has(id)),
  ];
};
