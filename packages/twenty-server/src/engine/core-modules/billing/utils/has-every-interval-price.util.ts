/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_PRICE_INTERVALS } from 'src/engine/core-modules/billing/constants/application-price-intervals.constant';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';

export const hasEveryIntervalPrice = <
  TBillingProduct extends {
    billingPrices: Pick<BillingPriceEntity, 'active' | 'interval'>[];
  },
>(
  billingProduct: TBillingProduct | undefined,
): billingProduct is TBillingProduct =>
  isDefined(billingProduct) &&
  APPLICATION_PRICE_INTERVALS.every((interval) =>
    billingProduct.billingPrices.some(
      (billingPrice) =>
        billingPrice.active && billingPrice.interval === interval,
    ),
  );
