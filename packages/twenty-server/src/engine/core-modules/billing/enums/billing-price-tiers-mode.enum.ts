/* @license Enterprise */

import { registerEnumType } from '@nestjs/graphql';

export enum BillingPriceTiersMode {
  GRADUATED = 'GRADUATED',
  VOLUME = 'VOLUME',
}
registerEnumType(BillingPriceTiersMode, {
  name: 'BillingPriceTiersMode',
  description: 'The different billing price tiers modes',
});
