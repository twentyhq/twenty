import { Field, InputType, OmitType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpdateWorkflowVersionPositionsInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-version-positions.input';

@InputType()
export class UpdateCoreWorkflowVersionPositionsInput extends OmitType(
  UpdateWorkflowVersionPositionsInput,
  ['workflowVersionId'] as const,
) {
  @Field(() => UUIDScalarType, {
    description: 'Core workflow version ID',
    nullable: false,
  })
  @IsUUID()
  coreWorkflowVersionId: string;
}
