import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceUrlsDTO } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType('WorkspaceUrlsAndId')
export class WorkspaceUrlsAndIdDTO {
  @Field(() => WorkspaceUrlsDTO)
  workspaceUrls: WorkspaceUrlsDTO;

  @Field(() => UUIDScalarType)
  id: string;
}
