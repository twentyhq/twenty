// The front component chunks the selection into batches of this size and the
// route rejects anything larger, so a single call always stays inside the
// function timeout no matter how many records the user selected.
export const RECOMPUTE_BATCH_SIZE = 20;
