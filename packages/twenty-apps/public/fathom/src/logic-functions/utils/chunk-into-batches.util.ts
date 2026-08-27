export const chunkIntoBatches = <TData>(
  values: TData[],
  batchSize: number,
): TData[][] => {
  const batches: TData[][] = [];

  for (let index = 0; index < values.length; index += batchSize) {
    batches.push(values.slice(index, index + batchSize));
  }

  return batches;
};
