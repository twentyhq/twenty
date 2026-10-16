/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import {
  BillingLicensedProduct,
  BillingMeteredProduct,
} from 'src/engine/core-modules/billing/dtos/billing-product.dto';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

@ObjectType('BillingPlan')
export class BillingPlanDTO {
  @Field(() => BillingPlanKey)
  planKey: BillingPlanKey;

  @Field(() => Boolean)
  isSellable: boolean;

  @Field(() => [BillingPlanKey])
  upgradePlanKeys: BillingPlanKey[];

  @Field(() => [BillingPlanKey])
  downgradePlanKeys: BillingPlanKey[];

  @Field(() => [BillingLicensedProduct])
  baseProducts: BillingLicensedProduct[];

  @Field(() => [BillingLicensedProduct])
  resourceCreditProducts: BillingLicensedProduct[];

  @Field(() => [BillingMeteredProduct])
  meteredProducts: BillingMeteredProduct[];
}
