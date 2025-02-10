import { Field, ObjectType } from '@nestjs/graphql';

import { workspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType()
export class WorkspaceUrlsAndId {
  @Field(() => workspaceUrls)
  workspaceUrls: workspaceUrls;

  @Field()
  id: string;
}
