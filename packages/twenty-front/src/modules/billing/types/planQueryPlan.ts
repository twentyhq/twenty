import { ArrayElement } from 'type-fest/source/internal';
import { BillingBaseProductPricesQuery } from '~/generated/graphql';

export type BillingBaseProductPricesQueryPlan = ArrayElement<
  BillingBaseProductPricesQuery['plans']
>;
