import { ArgsType, Field } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import Stripe from 'stripe';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ArgsType()
export class CheckoutSessionInput {
  @Field(() => SubscriptionInterval)
  @IsString()
  @IsNotEmpty()
  recurringInterval: Stripe.Price.Recurring.Interval;

  @Field(() => BillingPlanKey, { defaultValue: BillingPlanKey.PRO })
  @IsString()
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
