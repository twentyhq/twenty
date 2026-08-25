export const getIdBatches = (ids: string[], batchSize: number): string[][] => {
  const idBatches: string[][] = [];

  for (let batchStart = 0; batchStart < ids.length; batchStart += batchSize) {
    idBatches.push(ids.slice(batchStart, batchStart + batchSize));
  }

  return idBatches;
};
