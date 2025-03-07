import { BillingPriceLicensedDto } from '~/generated/graphql';

export const isBillingPriceLicensed = <T extends { __typename?: string }>(
  price: T,
): price is T & BillingPriceLicensedDto => {
  return price?.__typename === 'BillingPriceLicensedDTO';
};
