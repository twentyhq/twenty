/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum } from 'class-validator';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ArgsType()
export class BillingSwitchPlanInput {
  @Field(() => BillingPlanKey)
  @IsEnum(BillingPlanKey)
  targetPlanKey: BillingPlanKey;

  @Field(() => SubscriptionInterval)
  @IsEnum(SubscriptionInterval)
  targetInterval: SubscriptionInterval;
}
