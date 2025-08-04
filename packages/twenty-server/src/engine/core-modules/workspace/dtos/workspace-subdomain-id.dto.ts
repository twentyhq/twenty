import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType()
export class WorkspaceUrlsAndId {
  @Field(() => WorkspaceUrls)
  workspaceUrls: WorkspaceUrls;

  @Field(() => UUIDScalarType)
  id: string;
}
