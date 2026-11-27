import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';

@ObjectType()
export class AuthTokenPair {
  @Field(() => AuthToken)
  accessOrWorkspaceAgnosticToken: AuthToken;

  @Field(() => AuthToken, {
    nullable: true,
    deprecationReason: 'Always null. Will be removed.',
  })
  refreshToken?: AuthToken;
}
