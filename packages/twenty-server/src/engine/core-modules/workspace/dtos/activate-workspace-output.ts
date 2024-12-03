import { Field, ObjectType } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';

@ObjectType()
export class ActivateWorkspaceOutput {
  @Field(() => Workspace)
  workspace: Workspace;

  @Field(() => AuthToken)
  loginToken: AuthToken;
}
