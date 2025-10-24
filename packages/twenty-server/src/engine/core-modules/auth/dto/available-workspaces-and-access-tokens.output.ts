import { Field, ObjectType } from '@nestjs/graphql';

import { AvailableWorkspaces } from 'src/engine/core-modules/auth/dto/available-workspaces.output';

import { AuthTokenPair } from './auth-token-pair.dto';

@ObjectType()
export class AvailableWorkspacesAndAccessTokensOutput {
  @Field(() => AuthTokenPair)
  tokens: AuthTokenPair;

  @Field(() => AvailableWorkspaces)
  availableWorkspaces: AvailableWorkspaces;
}
