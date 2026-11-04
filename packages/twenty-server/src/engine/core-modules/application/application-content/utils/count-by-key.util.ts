import { isDefined } from 'twenty-shared/utils';

export const countByKey = <TItem>({
  items,
  getKey,
}: {
  items: TItem[];
  getKey: (item: TItem) => string | null | undefined;
}): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item);

    if (isDefined(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return counts;
};
