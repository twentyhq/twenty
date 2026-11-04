import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsString, IsUUID, MaxLength } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';
import { CODE_STEP_SOURCE_MAX_LENGTH } from 'twenty-shared/workflow';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class TestWorkflowCodeStepInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow version the code step belongs to',
  })
  @IsUUID()
  workflowVersionId: string;

  @Field(() => String, { description: 'TypeScript source of the code step' })
  @IsString()
  @MaxLength(CODE_STEP_SOURCE_MAX_LENGTH)
  code: string;

  @Field(() => graphqlTypeJson, { description: 'Payload in JSON format' })
  @IsObject()
  payload: object;
}
