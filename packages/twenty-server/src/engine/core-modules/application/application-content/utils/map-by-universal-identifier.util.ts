export const mapByUniversalIdentifier = <
  TItem extends { universalIdentifier: string },
  TValue,
>({
  items,
  getValue,
}: {
  items: TItem[];
  getValue: (item: TItem) => TValue;
}): Map<string, TValue> =>
  new Map(items.map((item) => [item.universalIdentifier, getValue(item)]));
