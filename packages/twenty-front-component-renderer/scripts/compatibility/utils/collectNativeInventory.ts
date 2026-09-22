import { type Page } from 'playwright';

export const collectNativeInventory = ({
  page,
  source,
}: {
  page: Page;
  source: string;
}): Promise<unknown> =>
  page.evaluate(`(() => {
  const before = Reflect.ownKeys(globalThis);
  ${source}
  const result = inventoryReference.nativeInventory();
  const after = Reflect.ownKeys(globalThis);
  if (before.length !== after.length || before.some((key) => !after.includes(key))) {
    throw new Error('Native collector changed the reference globals');
  }
  return result;
})()`);
