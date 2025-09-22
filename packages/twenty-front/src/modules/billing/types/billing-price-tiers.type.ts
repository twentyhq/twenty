import type { BillingPriceMeteredDto } from '~/generated/graphql';

export type BillingPriceTiers = [
  {
    flatAmount: number;
    unitAmount: null;
    upTo: number;
  },
  {
    flatAmount: null;
    unitAmount: number;
    upTo: null;
  },
];

// graphql does not support tuple so we need to create a new type
export type MeteredBillingPrice = Omit<BillingPriceMeteredDto, 'tiers'> & {
  tiers: BillingPriceTiers;
};
