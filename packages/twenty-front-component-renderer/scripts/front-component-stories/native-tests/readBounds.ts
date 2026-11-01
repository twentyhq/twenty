import { type Locator } from 'playwright/test';
import { isDefined } from 'twenty-shared/utils';

export const readBounds = async (locator: Locator) => {
  const bounds = await locator.boundingBox();

  if (!isDefined(bounds)) {
    throw new Error(`Bounds are unavailable for ${locator}`);
  }

  return bounds;
};
