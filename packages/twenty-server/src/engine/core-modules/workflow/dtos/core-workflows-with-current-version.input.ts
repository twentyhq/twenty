import { ArgsType, Field } from '@nestjs/graphql';

import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export const MAX_CORE_WORKFLOWS_WITH_CURRENT_VERSION_IDS = 100;

@ArgsType()
export class CoreWorkflowsWithCurrentVersionArgs {
  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayMaxSize(MAX_CORE_WORKFLOWS_WITH_CURRENT_VERSION_IDS)
  @IsUUID(undefined, { each: true })
  coreWorkflowIds: string[];
}
