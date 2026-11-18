/* @license Enterprise */

export type SubscriptionStripePrices = {
  baseProductPriceId: string;
  seats: number;
  resourceCreditPriceId: string;
  targetApplicationPriceIdByCurrentPriceId: Map<string, string>;
};
