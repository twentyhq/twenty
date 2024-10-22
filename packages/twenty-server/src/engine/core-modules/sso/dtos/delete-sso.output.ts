/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeleteSsoOutput {
  @Field(() => String)
  identityProviderId: string;
}
