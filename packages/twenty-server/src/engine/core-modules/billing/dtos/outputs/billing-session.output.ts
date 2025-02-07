/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingSessionOutput {
  @Field(() => String, { nullable: true })
  url: string;
}
