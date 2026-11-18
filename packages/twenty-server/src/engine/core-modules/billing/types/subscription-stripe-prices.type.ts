/* @license Enterprise */

export type SubscriptionStripePrices = {
  baseProductPriceId: string;
  seats: number;
  resourceCreditPriceId: string;
  applicationPriceIds: string[];
  targetApplicationPriceIdByCurrentPriceId?: Map<string, string>;
};
