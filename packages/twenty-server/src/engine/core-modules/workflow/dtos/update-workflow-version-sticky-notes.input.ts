import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { type WorkflowStickyNote } from 'twenty-shared/workflow';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWorkflowVersionStickyNotesInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => [graphqlTypeJson], {
    description: 'Sticky notes to update in JSON format',
    nullable: false,
  })
  notes: WorkflowStickyNote[];
}
