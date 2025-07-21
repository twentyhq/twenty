import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class InitiateTwoFactorAuthenticationProvisioningInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  loginToken: string;
}
