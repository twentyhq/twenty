import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import {
  type BillingPriceLicensed,
  type BillingSubscriptionSchedulePhaseItem,
} from '~/generated-metadata/graphql';

export const splitPhaseItemsInPricesOrThrow = ({
  phaseItems,
  billingPrices,
}: {
  phaseItems: Pick<BillingSubscriptionSchedulePhaseItem, 'price'>[];
  billingPrices: BillingPriceLicensed[];
}) => {
  const phaseBillingPrices = phaseItems
    .map(({ price }) =>
      billingPrices.find(({ stripePriceId }) => stripePriceId === price),
    )
    .filter(isDefined);

  const nextResourceCreditPrice = phaseBillingPrices.find(({ creditAmount }) =>
    isDefined(creditAmount),
  );
  const nextBasePrice = phaseBillingPrices.find(
    ({ creditAmount }) => !isDefined(creditAmount),
  );

  if (!isDefined(nextBasePrice) || !isDefined(nextResourceCreditPrice)) {
    throw new Error(
      doNotTranslate('Next billing phase has no base or resource credit price'),
    );
  }

  return { nextBasePrice, nextResourceCreditPrice };
};
