/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsString } from 'class-validator';

@InputType()
export class GetAuthorizationUrlInput {
  @Field(() => String)
  @IsString()
  identityProviderId: string;

  @Field(() => Boolean)
  @IsBoolean()
  forceSubdomainUrl: boolean;
}
