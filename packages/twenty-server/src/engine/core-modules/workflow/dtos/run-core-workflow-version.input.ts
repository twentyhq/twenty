import { Field, InputType, OmitType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RunWorkflowVersionInput } from 'src/engine/core-modules/workflow/dtos/run-workflow-version.input';

@InputType()
export class RunCoreWorkflowVersionInput extends OmitType(
  RunWorkflowVersionInput,
  ['workflowVersionId'] as const,
) {
  @Field(() => UUIDScalarType, {
    description: 'Core workflow version ID',
    nullable: false,
  })
  @IsUUID()
  coreWorkflowVersionId: string;
}
