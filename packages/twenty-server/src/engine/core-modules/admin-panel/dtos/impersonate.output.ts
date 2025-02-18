import { Field, ObjectType } from '@nestjs/graphql';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { WorkspaceUrlsAndId } from 'src/engine/core-modules/workspace/dtos/workspace-subdomain-id.dto';

@ObjectType()
export class ImpersonateOutput {
  @Field(() => AuthToken)
  loginToken: AuthToken;

  @Field(() => WorkspaceUrlsAndId)
  workspace: WorkspaceUrlsAndId;
}
