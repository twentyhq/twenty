import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ArgsType()
export class CheckoutSessionInput {
  @Field(() => SubscriptionInterval)
  @IsEnum(SubscriptionInterval)
  @IsNotEmpty()
  recurringInterval: SubscriptionInterval;

  @Field(() => BillingPlanKey, { defaultValue: BillingPlanKey.PRO })
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
