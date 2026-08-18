export const chunk = <TItem>(
  items: TItem[],
  batchSize: number,
): TItem[][] => {
  return Array.from(
    { length: Math.ceil(items.length / batchSize) },
    (_, batchIndex) =>
      items.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize),
  );
};
