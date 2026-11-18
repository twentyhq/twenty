import { isDefined } from 'twenty-shared/utils';
import {
  type BillingPriceLicensed,
  type BillingPriceMetered,
  BillingUsageType,
} from '~/generated-metadata/graphql';

type BillingPrice = BillingPriceLicensed | BillingPriceMetered;

const isBillingPriceLicensed = (
  billingPrice: BillingPrice,
): billingPrice is BillingPriceLicensed =>
  billingPrice.priceUsageType === BillingUsageType.LICENSED;

export const splitPhaseItemsInPrices = ({
  phaseItems,
  billingPrices,
}: {
  phaseItems: { price: string }[];
  billingPrices: BillingPrice[];
}) =>
  phaseItems.reduce<{
    nextBasePrice?: BillingPriceLicensed;
    nextResourceCreditPrice?: BillingPriceLicensed;
  }>((splitPrices, phaseItem) => {
    const billingPrice = billingPrices.find(
      ({ stripePriceId }) => stripePriceId === phaseItem.price,
    );

    if (!isDefined(billingPrice) || !isBillingPriceLicensed(billingPrice)) {
      return splitPrices;
    }

    return isDefined(billingPrice.creditAmount)
      ? { ...splitPrices, nextResourceCreditPrice: billingPrice }
      : { ...splitPrices, nextBasePrice: billingPrice };
  }, {});
