import { Field, Float, ObjectType } from '@nestjs/graphql';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

@ObjectType()
export class BillingMeteredProductUsageOutput {
  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => Float)
  usedCredits: number;

  @Field(() => Float)
  grantedCredits: number;

  @Field(() => Float)
  rolloverCredits: number;

  @Field(() => Float)
  totalGrantedCredits: number;

  @Field(() => Float)
  unitPriceCents: number;
}
