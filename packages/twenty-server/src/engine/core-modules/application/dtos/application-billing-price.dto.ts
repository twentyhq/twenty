import { Field, Int, ObjectType } from '@nestjs/graphql';

import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { ApplicationBillingPriceCurrencyEnum } from 'src/engine/core-modules/application/dtos/application-billing-price-currency.enum';
import { ApplicationBillingPricePeriodEnum } from 'src/engine/core-modules/application/dtos/application-billing-price-period.enum';
import { ApplicationBillingPriceTypeEnum } from 'src/engine/core-modules/application/dtos/application-billing-price-type.enum';
import { ApplicationBillingPriceUnitEnum } from 'src/engine/core-modules/application/dtos/application-billing-price-unit.enum';

@ObjectType('ApplicationBillingPrice')
export class ApplicationBillingPriceDTO {
  @Field()
  universalIdentifier: string;

  @Field()
  label: string;

  @Field(() => ApplicationBillingPriceTypeEnum)
  type: ApplicationBillingPrice['type'];

  @Field(() => ApplicationBillingPricePeriodEnum)
  billingPeriod: ApplicationBillingPrice['billingPeriod'];

  @Field(() => Int)
  amountCents: number;

  @Field(() => ApplicationBillingPriceCurrencyEnum)
  currency: NonNullable<ApplicationBillingPrice['currency']>;

  @Field(() => ApplicationBillingPriceUnitEnum, { nullable: true })
  per: NonNullable<ApplicationBillingPrice['per']> | null;
}
