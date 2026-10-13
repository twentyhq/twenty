export const chunkIntoBatches = <TItem>(
  items: TItem[],
  batchSize: number,
): TItem[][] =>
  Array.from({ length: Math.ceil(items.length / batchSize) }, (_, batchIndex) =>
    items.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize),
  );
