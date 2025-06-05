import { Field, ObjectType } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@ObjectType()
export class AvailableWorkspacesToJoin {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  logo: Workspace['logo'];

  @Field(() => String, { nullable: true })
  displayName: Workspace['displayName'];

  @Field(() => String)
  workspaceUrl: string;
}
