import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

import { AuthToken } from './token.entity';

@ObjectType()
export class GetLoginTokenFromEmailVerificationTokenOutput {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => WorkspaceUrls)
  workspaceUrls: WorkspaceUrls;
}
