import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';

registerEnumType(WorkflowVersionStatus, {
  name: 'CoreWorkflowVersionStatus',
});

@ObjectType('CoreWorkflowVersionDTO')
export class CoreWorkflowVersionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => WorkflowVersionStatus)
  status: WorkflowVersionStatus;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceWorkflowVersionId: string | null;

  @Field(() => String)
  createdAt: string;
}
