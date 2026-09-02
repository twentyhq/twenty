import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

registerEnumType(WorkflowStatus, {
  name: 'CoreWorkflowStatus',
});

@ObjectType('CoreWorkflowDTO')
export class CoreWorkflowDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => [WorkflowStatus])
  statuses: WorkflowStatus[];

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceWorkflowId: string | null;

  @Field(() => String)
  updatedAt: string;
}
