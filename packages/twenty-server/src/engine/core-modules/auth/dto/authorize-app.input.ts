import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class AuthorizeAppInput {
  @Field(() => String)
  clientId: string;

  @Field(() => String)
  codeChallenge: string;
}
