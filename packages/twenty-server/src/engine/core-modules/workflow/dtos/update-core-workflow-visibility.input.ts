import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsUUID } from 'class-validator';
import { WorkflowVisibility } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateCoreWorkflowVisibilityInput {
  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  coreWorkflowId: string;

  @Field(() => WorkflowVisibility, { nullable: false })
  @IsEnum(WorkflowVisibility)
  visibility: WorkflowVisibility;
}
