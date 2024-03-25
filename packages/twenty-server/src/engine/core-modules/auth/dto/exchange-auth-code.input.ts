import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ExchangeAuthCodeInput {
  @Field(() => String)
  authorizationCode: string;

  @Field(() => String)
  codeVerifier: string;
}
