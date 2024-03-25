import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';

@ObjectType()
export class ExchangeAuthCode {
  @Field(() => AuthToken)
  accessToken: AuthToken;

  @Field(() => AuthToken)
  refreshToken: AuthToken;

  @Field(() => AuthToken)
  loginToken: AuthToken;
}
