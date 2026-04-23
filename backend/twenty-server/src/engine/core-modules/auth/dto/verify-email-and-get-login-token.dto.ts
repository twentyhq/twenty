import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceUrlsDTO } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

import { AuthToken } from './auth-token.dto';

@ObjectType('VerifyEmailAndGetLoginToken')
export class VerifyEmailAndGetLoginTokenDTO {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => WorkspaceUrlsDTO)
  workspaceUrls: WorkspaceUrlsDTO;
}
