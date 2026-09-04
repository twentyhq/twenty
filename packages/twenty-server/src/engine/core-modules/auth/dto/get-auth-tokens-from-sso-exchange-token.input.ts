import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class GetAuthTokensFromSsoExchangeTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  ssoExchangeToken: string;
}
