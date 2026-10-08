import { Field, InputType } from '@nestjs/graphql';

import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CoreWorkflowsWithCurrentVersionsInput {
  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  coreWorkflowIds: string[];
}
