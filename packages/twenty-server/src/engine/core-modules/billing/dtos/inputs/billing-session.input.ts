/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class BillingSessionInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  returnUrlPath?: string;
}
