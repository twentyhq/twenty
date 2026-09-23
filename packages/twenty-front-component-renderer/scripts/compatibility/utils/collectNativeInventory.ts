import { isString } from '@sniptt/guards';
import { type Page } from 'playwright';

import { buildNativeInventoryScript } from './buildNativeInventoryScript';

export const collectNativeInventory = async ({
  page,
  source,
}: {
  page: Page;
  source: string;
}): Promise<unknown> => {
  const serializedResult: unknown = await page.evaluate(
    buildNativeInventoryScript(source),
  );
  if (!isString(serializedResult)) {
    throw new Error('Malformed native collection output');
  }
  return JSON.parse(serializedResult);
};
