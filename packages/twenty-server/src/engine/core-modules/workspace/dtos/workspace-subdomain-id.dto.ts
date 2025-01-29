import { Field, ObjectType } from '@nestjs/graphql';

import { WorkspaceEndpoints } from 'src/engine/core-modules/workspace/dtos/workspace-endpoints.dto';

@ObjectType()
export class WorkspaceEndpointsAndId {
  @Field(() => WorkspaceEndpoints)
  workspaceEndpoints: WorkspaceEndpoints;

  @Field()
  id: string;
}
