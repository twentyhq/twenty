import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { WorkspaceUrlsAndIdDTO } from 'src/engine/core-modules/workspace/dtos/workspace-subdomain-id.dto';

@ObjectType('Impersonate')
export class ImpersonateDTO {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => WorkspaceUrlsAndIdDTO)
  workspace: WorkspaceUrlsAndIdDTO;
}
