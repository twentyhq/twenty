/* @license Enterprise */

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { BillingProductPriceDTO } from 'src/engine/core-modules/billing/dtos/billing-product-price.dto';

@ObjectType()
export class BillingProductPricesOutput {
  @Field(() => Int)
  totalNumberOfPrices: number;

  @Field(() => [BillingProductPriceDTO])
  productPrices: BillingProductPriceDTO[];
}
