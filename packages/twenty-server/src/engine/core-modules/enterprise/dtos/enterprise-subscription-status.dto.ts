/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnterpriseSubscriptionStatusDTO {
  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  licensee: string | null;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => Date, { nullable: true })
  cancelAt: Date | null;

  @Field(() => Date, { nullable: true })
  currentPeriodEnd: Date | null;

  @Field(() => Boolean)
  isCancellationScheduled: boolean;
}
