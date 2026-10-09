import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class SubmitFormStepInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow run ID',
    nullable: false,
  })
  workflowRunId: string;

  @Field(() => UUIDScalarType, {
    description: 'Form step ID',
    nullable: false,
  })
  stepId: string;

  @Field(() => graphqlTypeJson, {
    description: 'Form values keyed by field name',
    nullable: false,
  })
  response: Record<string, unknown>;
}
