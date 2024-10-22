/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@InputType()
export class DeleteSsoInput {
  @Field(() => String)
  @IsUUID()
  identityProviderId: string;
}
