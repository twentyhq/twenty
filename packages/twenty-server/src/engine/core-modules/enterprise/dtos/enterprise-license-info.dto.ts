/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EnterpriseLicenseInfoDTO {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => String, { nullable: true })
  licensee: string | null;

  @Field(() => Date, { nullable: true })
  expiresAt: Date | null;

  @Field(() => String, { nullable: true })
  subscriptionId: string | null;
}
