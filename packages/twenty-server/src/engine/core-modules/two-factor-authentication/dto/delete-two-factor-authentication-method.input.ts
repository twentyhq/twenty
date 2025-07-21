import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class DeleteTwoFactorAuthenticationMethodInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  twoFactorAuthenticationMethodId: string;
}
