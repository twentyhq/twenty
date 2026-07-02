/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum, IsOptional } from 'class-validator';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ArgsType()
export class BillingSwitchPlanInput {
  @Field(() => BillingPlanKey, { nullable: true })
  @IsEnum(BillingPlanKey)
  @IsOptional()
  targetPlanKey?: BillingPlanKey;

  @Field(() => SubscriptionInterval, { nullable: true })
  @IsEnum(SubscriptionInterval)
  @IsOptional()
  targetInterval?: SubscriptionInterval;
}
