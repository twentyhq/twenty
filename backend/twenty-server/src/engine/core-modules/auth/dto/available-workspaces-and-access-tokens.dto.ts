import { Field, ObjectType } from '@nestjs/graphql';

import { AvailableWorkspaces } from 'src/engine/core-modules/auth/dto/available-workspaces.dto';

import { AuthTokenPair } from './auth-token-pair.dto';

@ObjectType('AvailableWorkspacesAndAccessTokens')
export class AvailableWorkspacesAndAccessTokensDTO {
  @Field(() => AuthTokenPair)
  tokens: AuthTokenPair;

  @Field(() => AvailableWorkspaces)
  availableWorkspaces: AvailableWorkspaces;
}
