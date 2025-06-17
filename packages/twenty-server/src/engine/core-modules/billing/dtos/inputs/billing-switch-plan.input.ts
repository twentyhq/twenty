import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

@ArgsType()
export class BillingSwitchPlanInput {
  @Field(() => BillingPlanKey, { nullable: false })
  @IsEnum(BillingPlanKey)
  @IsNotEmpty()
  plan: BillingPlanKey;
}
