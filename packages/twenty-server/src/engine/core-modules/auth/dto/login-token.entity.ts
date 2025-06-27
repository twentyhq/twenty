import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from './token.entity';
import { IsOptional } from 'class-validator';

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
