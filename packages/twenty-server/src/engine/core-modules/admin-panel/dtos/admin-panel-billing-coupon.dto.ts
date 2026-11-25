import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminPanelBillingCoupon')
export class AdminPanelBillingCouponDTO {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => Float, { nullable: true })
  percentOff: number | null;

  @Field(() => Int, { nullable: true })
  amountOff: number | null;

  @Field(() => String, { nullable: true })
  currency: string | null;

  @Field(() => String)
  duration: string;

  @Field(() => Int, { nullable: true })
  durationInMonths: number | null;
}
