import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsString, IsUUID, MaxLength } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

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
  @MaxLength(256_000)
  code: string;

  @Field(() => graphqlTypeJson, { description: 'Payload in JSON format' })
  @IsObject()
  payload: object;
}
