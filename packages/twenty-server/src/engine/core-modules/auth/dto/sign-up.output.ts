import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceUrlsAndIdDTO } from 'src/engine/core-modules/workspace/dtos/workspace-subdomain-id.dto';

import { AuthToken } from './auth-token.dto';

@ObjectType('SignUpOutput')
export class SignUpOutput {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => WorkspaceUrlsAndIdDTO)
  workspace: WorkspaceUrlsAndIdDTO;
}
