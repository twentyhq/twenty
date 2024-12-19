import { ArgsType, Field } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import Stripe from 'stripe';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ArgsType()
export class CheckoutSessionInput {
  @Field(() => SubscriptionInterval)
  @IsString()
  @IsNotEmpty()
  recurringInterval: Stripe.Price.Recurring.Interval;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  successUrlPath?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  requirePaymentMethod?: boolean;
}
