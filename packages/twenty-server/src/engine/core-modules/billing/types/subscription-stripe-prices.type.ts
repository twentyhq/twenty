/* @license Enterprise */

export type SubscriptionStripePrices = {
  baseProductPriceId: string;
  seats: number;
  resourceCreditPriceId: string;
  applicationPriceIdByCurrentPriceId: Map<string, string>;
};
