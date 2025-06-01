/* @license Enterprise */

import { ArgsType, Field } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { BillingPaymentProviders } from 'src/engine/core-modules/billing/enums/billing-payment-providers.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';

@ArgsType()
export class BillingCheckoutSessionInput {
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

  @Field(() => BillingPaymentProviders, {
    defaultValue: BillingPaymentProviders.Stripe,
  })
  @IsEnum(BillingPaymentProviders)
  @IsOptional()
  paymentProvider: BillingPaymentProviders;

  @Field(() => InterCreateChargeDto, { nullable: true })
  @ValidateNested()
  @Type(() => InterCreateChargeDto)
  @ValidateIf((data) => data.paymentProvider === BillingPaymentProviders.Inter)
  interChargeData: InterCreateChargeDto;
}
