/* @license Enterprise */

type SubscriptionPricesToCompare = {
  licensedPriceId: string;
  seats: number;
  resourceCreditPriceId: string;
};

export const isNoOpSubscriptionUpdate = ({
  toUpdatePrices,
  currentLicensedPriceId,
  currentResourceCreditPriceId,
  currentSeats,
}: {
  toUpdatePrices: SubscriptionPricesToCompare;
  currentLicensedPriceId: string;
  currentResourceCreditPriceId: string;
  currentSeats: number | null;
}): boolean =>
  toUpdatePrices.licensedPriceId === currentLicensedPriceId &&
  toUpdatePrices.resourceCreditPriceId === currentResourceCreditPriceId &&
  toUpdatePrices.seats === currentSeats;
