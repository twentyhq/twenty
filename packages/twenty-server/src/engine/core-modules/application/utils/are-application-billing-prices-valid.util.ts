import { isArray } from '@sniptt/guards';
import {
  type ApplicationBillingPrice,
  isApplicationBillingPrice,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const areApplicationBillingPricesValid = (
  prices: unknown,
): prices is ApplicationBillingPrice[] | null | undefined =>
  !isDefined(prices) ||
  (isArray(prices) &&
    prices.every(isApplicationBillingPrice) &&
    new Set(prices.map(({ universalIdentifier }) => universalIdentifier))
      .size === prices.length);
