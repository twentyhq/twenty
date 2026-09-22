export type InventoryObjects = {
  globalThis: object;
  window: object;
  factories: Record<string, () => unknown>;
};
