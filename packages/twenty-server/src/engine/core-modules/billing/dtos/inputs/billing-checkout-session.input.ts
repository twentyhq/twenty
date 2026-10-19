/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { BILLING_SELLABLE_PLAN_KEYS } from 'src/engine/core-modules/billing/constants/billing-sellable-plan-keys.constant';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ArgsType()
export class BillingCheckoutSessionInput {
  @Field(() => SubscriptionInterval)
  @IsEnum(SubscriptionInterval)
  @IsNotEmpty()
  recurringInterval: SubscriptionInterval;

  @Field(() => BillingPlanKey, { defaultValue: BILLING_SELLABLE_PLAN_KEYS[0] })
  @IsEnum(BillingPlanKey)
  @IsOptional()
  plan?: BillingPlanKey;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  requirePaymentMethod?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  successUrlPath?: string;
}
