// A total order over createdAt then id keeps offset windows stable while the
// backfill runs: newly created records sort to the tail, so the batch each job
// owns does not shift under it.
const BACKFILL_ORDER_BY = [
  { createdAt: 'AscNullsFirst' },
  { id: 'AscNullsFirst' },
];

// Query args selecting the record window a batch job owns.
export const buildBackfillBatchArgs = (
  batchId: number,
  batchSize: number,
): { first: number; offset: number; orderBy: typeof BACKFILL_ORDER_BY } => ({
  first: batchSize,
  offset: batchId * batchSize,
  orderBy: BACKFILL_ORDER_BY,
});
