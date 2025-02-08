/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingProductDTO } from 'src/engine/core-modules/billing/dtos/billing-product.dto';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

@ObjectType()
export class BillingPlanOutput {
  @Field(() => BillingPlanKey)
  planKey: BillingPlanKey;

  @Field(() => BillingProductDTO)
  baseProduct: BillingProductDTO;

  @Field(() => [BillingProductDTO])
  otherLicensedProducts: BillingProductDTO[];

  @Field(() => [BillingProductDTO])
  meteredProducts: BillingProductDTO[];
}
