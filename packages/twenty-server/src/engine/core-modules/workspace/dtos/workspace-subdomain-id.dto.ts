import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType()
export class WorkspaceUrlsAndId {
  @Field(() => WorkspaceUrls)
  workspaceUrls: WorkspaceUrls;

  @Field()
  id: string;
}
