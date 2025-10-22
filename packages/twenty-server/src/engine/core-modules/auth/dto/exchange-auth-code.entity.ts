import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

@ObjectType()
export class ExchangeAuthCode {
  @Field(() => AuthToken)
  accessOrWorkspaceAgnosticToken: AuthToken;

  @Field(() => AuthToken)
  refreshToken: AuthToken;

  @Field(() => AuthToken)
  loginToken: AuthToken;
}
