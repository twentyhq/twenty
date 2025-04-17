import { Field, ObjectType } from '@nestjs/graphql';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

@ObjectType()
export class BillingMeteredProductUsageOutput {
  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => Number)
  usageQuantity: number;

  @Field(() => Number)
  freeTierQuantity: number;

  @Field(() => Number)
  freeTrialQuantity: number;

  @Field(() => Number)
  unitPriceCents: number;

  @Field(() => Number)
  totalCostCents: number;
}
