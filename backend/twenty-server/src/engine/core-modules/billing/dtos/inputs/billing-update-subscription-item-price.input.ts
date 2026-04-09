/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class BillingUpdateSubscriptionItemPriceInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  priceId: string;
}
