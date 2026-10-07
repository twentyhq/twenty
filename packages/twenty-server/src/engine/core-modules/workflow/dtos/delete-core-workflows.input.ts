import { Field, InputType } from '@nestjs/graphql';

import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { MAX_CORE_WORKFLOW_IDS_PER_REQUEST } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteCoreWorkflowsInput {
  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_CORE_WORKFLOW_IDS_PER_REQUEST)
  @IsUUID(undefined, { each: true })
  coreWorkflowIds: string[];
}
