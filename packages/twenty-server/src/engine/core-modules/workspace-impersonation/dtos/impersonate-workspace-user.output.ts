import { Field, ObjectType } from '@nestjs/graphql';

import { AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';

@ObjectType()
export class ImpersonateWorkspaceUserOutput {
  @Field(() => AuthTokens)
  tokens: AuthTokens;
}
