/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingEmail')
export class BillingEmailDTO {
  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => Boolean)
  isWorkspaceMemberEmail: boolean;
}
