export const getBatches = <TItem>(
  items: TItem[],
  batchSize: number,
): TItem[][] => {
  const batches: TItem[][] = [];

  for (let batchStart = 0; batchStart < items.length; batchStart += batchSize) {
    batches.push(items.slice(batchStart, batchStart + batchSize));
  }

  return batches;
};
