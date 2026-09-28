import { Field, InputType, OmitType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { DuplicateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/duplicate-workflow-version-step.input';

@InputType()
export class DuplicateCoreWorkflowVersionStepInput extends OmitType(
  DuplicateWorkflowVersionStepInput,
  ['workflowVersionId'] as const,
) {
  @Field(() => UUIDScalarType, {
    description: 'Core workflow version ID',
    nullable: false,
  })
  @IsUUID()
  coreWorkflowVersionId: string;
}
