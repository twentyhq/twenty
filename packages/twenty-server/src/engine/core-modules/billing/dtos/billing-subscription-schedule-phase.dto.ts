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
  start_date: number;

  @Field(() => Number)
  end_date: number;

  @Field(() => [BillingSubscriptionSchedulePhaseItem])
  items: Array<BillingSubscriptionSchedulePhaseItem>;
}
