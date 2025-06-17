/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingProductDTO } from 'src/engine/core-modules/billing/dtos/billing-product.dto';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

@ObjectType()
export class BillingSwitchPlanOutput {
  @Field(() => BillingPlanKey)
  planKey: BillingPlanKey;

  @Field(() => BillingProductDTO)
  baseProduct: BillingProductDTO;

  @Field(() => BillingSubscription)
  subscription: BillingSubscription;
}
