export const chunkIntoBatches = <TItem>(
  items: TItem[],
  batchSize: number,
): TItem[][] => {
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error('Batch size must be a positive integer');
  }

  return Array.from(
    { length: Math.ceil(items.length / batchSize) },
    (_, batchIndex) =>
      items.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize),
  );
};
