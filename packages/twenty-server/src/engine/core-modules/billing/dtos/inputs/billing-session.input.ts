/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class BillingSessionInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  returnUrlPath?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  forPaymentMethodUpdate?: boolean;
}
