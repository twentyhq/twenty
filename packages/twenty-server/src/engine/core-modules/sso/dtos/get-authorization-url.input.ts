/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class GetAuthorizationUrlInput {
  @Field(() => String)
  @IsString()
  identityProviderId: string;
}
