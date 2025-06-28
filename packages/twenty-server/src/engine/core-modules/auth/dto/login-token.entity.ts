import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

import { AuthToken } from './token.entity';

@ObjectType()
export class LoginToken {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => Boolean)
  @IsOptional()
  shouldTriggerTwoFactorAuthenticationFlow?: boolean;

  @Field(() => String)
  @IsOptional()
  typeOf2FAFlow?: string;
}
