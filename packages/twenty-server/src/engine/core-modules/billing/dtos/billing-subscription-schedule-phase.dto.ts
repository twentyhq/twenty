import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingSubscriptionSchedulePhaseItem')
export class BillingSubscriptionSchedulePhaseItemDTO {
  @Field(() => String)
  price: string;

  @Field(() => Number, { nullable: true })
  quantity?: number;
}

@ObjectType('BillingSubscriptionSchedulePhase')
export class BillingSubscriptionSchedulePhaseDTO {
  @Field(() => Number)
  start_date: number;

  @Field(() => Number)
  end_date: number;

  @Field(() => [BillingSubscriptionSchedulePhaseItemDTO])
  items: Array<BillingSubscriptionSchedulePhaseItemDTO>;
}
