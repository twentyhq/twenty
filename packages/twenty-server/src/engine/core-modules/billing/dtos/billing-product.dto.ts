/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';
import { BillingPriceMeteredDTO } from 'src/engine/core-modules/billing/dtos/billing-price-metered.dto';
import { BillingPriceUnionDTO } from 'src/engine/core-modules/billing/dtos/billing-price-union.dto';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

@ObjectType()
export class BillingProductDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => BillingUsageType)
  type: BillingUsageType;

  @Field(() => [BillingPriceUnionDTO], { nullable: 'items' })
  prices: Array<BillingPriceLicensedDTO | BillingPriceMeteredDTO>;
}
