import { ArgsType, Field } from '@nestjs/graphql';

import { ArrayMaxSize, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const MAX_CORE_WORKFLOW_VERSIONS_BY_IDS = 100;

@ArgsType()
export class CoreWorkflowVersionsByIdsArgs {
  @Field(() => [UUIDScalarType])
  @ArrayMaxSize(MAX_CORE_WORKFLOW_VERSIONS_BY_IDS)
  @IsUUID(undefined, { each: true })
  workspaceWorkflowVersionIds: string[];
}
