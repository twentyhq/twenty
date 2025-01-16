import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

@ObjectType()
export class PriceLicensedDTO {
  @Field(() => SubscriptionInterval)
  recurringInterval: SubscriptionInterval;

  @Field(() => Number)
  unitAmount: number;
}
