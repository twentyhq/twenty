import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import Stripe from 'stripe';

@ArgsType()
export class CheckoutSessionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  recurringInterval: Stripe.Price.Recurring.Interval;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  successUrlPath?: string;
}
