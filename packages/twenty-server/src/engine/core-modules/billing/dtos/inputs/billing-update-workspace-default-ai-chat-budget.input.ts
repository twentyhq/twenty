/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsInt, IsOptional, Min } from 'class-validator';

@ArgsType()
export class BillingUpdateWorkspaceDefaultAiChatBudgetInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxCreditsPerPeriod: number | null;
}
