import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class RunWorkflowVersionInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => UUIDScalarType, {
    description: 'Workflow run ID',
    nullable: true,
  })
  workflowRunId?: string | null;

  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
    nullable: true,
  })
  payload?: JSON;
}
