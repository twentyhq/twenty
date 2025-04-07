/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { BillingPriceUnionDTO } from 'src/engine/core-modules/billing/dtos/billing-price-union.dto';
import { BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';

@ObjectType('BillingProduct')
export class BillingProductDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => [BillingPriceUnionDTO], { nullable: true })
  prices: Array<BillingPriceLicensedDTO> | Array<BillingPriceMeteredDTO>;

  @Field(() => BillingProductMetadata)
  metadata: BillingProductMetadata;
}
