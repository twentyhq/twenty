/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('UsageBreakdownItem')
export class UsageBreakdownItemDTO {
  @Field(() => String)
  key: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Float)
  creditsUsed: number;

  @Field(() => Float, { nullable: true })
  userCreditsUsed?: number | null;

  @Field(() => Float)
  workspaceCreditsUsed: number;
}
