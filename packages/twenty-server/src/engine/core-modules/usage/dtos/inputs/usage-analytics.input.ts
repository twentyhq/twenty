/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UsageAnalyticsInput {
  @Field(() => Date, { nullable: true })
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  periodEnd?: Date;

  @Field(() => String, { nullable: true })
  userWorkspaceId?: string;
}
