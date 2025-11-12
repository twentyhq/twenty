import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { WorkspaceUrlsAndIdDTO } from 'src/engine/core-modules/workspace/dtos/workspace-subdomain-id.dto';

@ObjectType('ImpersonateOutput')
export class ImpersonateOutput {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => WorkspaceUrlsAndIdDTO)
  workspace: WorkspaceUrlsAndIdDTO;
}
