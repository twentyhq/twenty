/* @license Enterprise */

export type ApplicationSubscriptionItem = {
  stripeProductId: string;
  stripePriceId: string;
  quantity: number;
};

export type SubscriptionStripePrices = {
  baseProductPriceId: string;
  seats: number;
  resourceCreditPriceId: string;
  applicationItems: ApplicationSubscriptionItem[];
};
