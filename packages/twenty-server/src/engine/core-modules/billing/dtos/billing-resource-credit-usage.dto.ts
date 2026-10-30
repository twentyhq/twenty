import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

@ObjectType('BillingResourceCreditUsage')
export class BillingResourceCreditUsageDTO {
  @Field(() => BillingProductKey)
  productKey: BillingProductKey;

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => Float)
  workspaceCreditsUsed: number;

  @Field(() => Float)
  userCreditsUsed: number;

  @Field(() => Float)
  workspaceCreditsGranted: number;

  @Field(() => Float)
  workspaceCreditsGrantedForSeats: number;

  @Field(() => Int)
  workspaceCreditsSeats: number;

  @Field(() => Float)
  workspaceCreditsExtraGranted: number;

  @Field(() => Float)
  workspaceCreditsTotalGranted: number;

  @Field(() => Float)
  unitPriceCents: number;
}
