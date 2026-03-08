import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

@ObjectType('ApplicationTokenPair')
export class ApplicationTokenPairDTO {
  @Field(() => AuthToken)
  applicationAccessToken: AuthToken;

  @Field(() => AuthToken)
  applicationRefreshToken: AuthToken;
}
