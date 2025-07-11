import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ResetTwoFactorAuthenticationMethodInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  twoFactorAuthenticationMethodId: string;
}
