import { Field, InputType, OmitType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CreateWorkflowVersionEdgeInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-edge.input';

@InputType()
export class CreateCoreWorkflowVersionEdgeInput extends OmitType(
  CreateWorkflowVersionEdgeInput,
  ['workflowVersionId'] as const,
) {
  @Field(() => UUIDScalarType, {
    description: 'Core workflow version ID',
    nullable: false,
  })
  @IsUUID()
  coreWorkflowVersionId: string;
}
