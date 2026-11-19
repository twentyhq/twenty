/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findProductPriceForIntervalOrThrow } from 'src/engine/core-modules/billing/utils/find-product-price-for-interval-or-throw.util';

type ApplicationPrice = {
  stripePriceId: string;
  billingProduct?:
    | Parameters<typeof findProductPriceForIntervalOrThrow>[0]
    | null;
};

export const computeApplicationPricesForIntervalOrThrow = ({
  applicationPriceIds,
  applicationPrices,
  interval,
}: {
  applicationPriceIds: string[];
  applicationPrices: ApplicationPrice[];
  interval: SubscriptionInterval;
}): Map<string, string> =>
  new Map(
    applicationPriceIds.map((currentPriceId) => {
      const billingProduct = applicationPrices.find(
        ({ stripePriceId }) => stripePriceId === currentPriceId,
      )?.billingProduct;

      if (!isDefined(billingProduct)) {
        throw new BillingException(
          `Application price ${currentPriceId} is not in the billing catalog or has no billing product`,
          BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
        );
      }

      return [
        currentPriceId,
        findProductPriceForIntervalOrThrow(billingProduct, interval)
          .stripePriceId,
      ];
    }),
  );
