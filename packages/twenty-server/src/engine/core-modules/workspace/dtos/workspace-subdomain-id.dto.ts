import { Field, ObjectType } from '@nestjs/graphql';

import { workspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-endpoints.dto';

@ObjectType()
export class workspaceUrlsAndId {
  @Field(() => workspaceUrls)
  workspaceUrls: workspaceUrls;

  @Field()
  id: string;
}
