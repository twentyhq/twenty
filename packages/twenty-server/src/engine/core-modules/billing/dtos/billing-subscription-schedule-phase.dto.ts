import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingSubscriptionSchedulePhaseItem {
  @Field(() => String)
  price: string;

  @Field(() => Number, { nullable: true })
  quantity?: number;
}

@ObjectType()
export class BillingSubscriptionSchedulePhase {
  @Field(() => Number)
  startDate: number;

  @Field(() => Number)
  endDate: number;

  @Field(() => Number, { nullable: true })
  trialEnd: number | null;

  @Field(() => [BillingSubscriptionSchedulePhaseItem])
  items: Array<BillingSubscriptionSchedulePhaseItem>;
}
