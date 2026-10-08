export type SendSlotRefusal = {
  retryDelayMs: number;
  windowMs: number;
  // What the workspace is actually allowed per window. A batch costing more
  // than this can never be admitted at its current size, however long it waits.
  limitValue: number | null;
};
