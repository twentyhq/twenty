export const buildNativeInventoryScript = (source: string): string => `(() => {
  const before = Reflect.ownKeys(globalThis);
  ${source}
  const result = inventoryReference.nativeInventory();
  const after = Reflect.ownKeys(globalThis);
  if (before.length !== after.length || before.some((key) => !after.includes(key))) {
    throw new Error('Native collector changed the reference globals');
  }
  return JSON.stringify(result);
})()`;
