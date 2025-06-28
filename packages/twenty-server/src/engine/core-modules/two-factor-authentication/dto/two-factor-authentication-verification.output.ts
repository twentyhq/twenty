import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';

@ObjectType()
export class TwoFactorAuthenticationVerificationOutput {
  @Field(() => AuthToken)
  @IsNotEmpty()
  @IsString()
  loginToken: AuthToken;
}
