import { Field, ObjectType } from '@nestjs/graphql';

import { BillingProductMetadata } from 'src/engine/core-modules/billing/types/billing-product-metadata.type';
import { BillingPriceLicensedDTO } from 'src/engine/core-modules/billing/dtos/billing-price-licensed.dto';

@ObjectType('BillingProduct')
export class BillingProductDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => BillingProductMetadata)
  metadata: BillingProductMetadata;
}

@ObjectType()
export class BillingLicensedProduct extends BillingProductDTO {
  @Field(() => [BillingPriceLicensedDTO], { nullable: true })
  prices: BillingPriceLicensedDTO[] | null;
}
