import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class GetAuthTokensFromSSOExchangeTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  ssoExchangeToken: string;
}
