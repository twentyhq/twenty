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
  usedCredits: number;

  @Field(() => Number)
  grantedCredits: number;

  @Field(() => Number)
  rolloverCredits: number;

  @Field(() => Number)
  totalGrantedCredits: number;

  @Field(() => Number)
  unitPriceCents: number;
}
