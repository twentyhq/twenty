/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum, IsOptional } from 'class-validator';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

@ArgsType()
export class BillingSwitchPlanInput {
  @Field(() => BillingPlanKey, { nullable: true })
  @IsEnum(BillingPlanKey)
  @IsOptional()
  plan?: BillingPlanKey;
}
