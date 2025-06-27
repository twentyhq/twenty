import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AuthToken } from '../../auth/dto/token.entity';

@ObjectType()
export class TwoFactorAuthenticationVerificationOutput {
  @Field(() => AuthToken)
  @IsNotEmpty()
  @IsString()
  loginToken: AuthToken;
}
