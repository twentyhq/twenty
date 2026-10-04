import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { WorkflowVisibility } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

registerEnumType(WorkflowStatus, {
  name: 'CoreWorkflowStatus',
});

registerEnumType(WorkflowVisibility, { name: 'WorkflowVisibility' });

@ObjectType('CoreWorkflowDTO')
export class CoreWorkflowDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => [WorkflowStatus])
  statuses: WorkflowStatus[];

  @Field(() => UUIDScalarType, { nullable: true })
  lastPublishedVersionId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  lastPublishedCoreWorkflowVersionId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceWorkflowId: string | null;

  @Field(() => Boolean, { nullable: false })
  isSystem: boolean;

  @Field(() => WorkflowVisibility, { nullable: false })
  visibility: WorkflowVisibility;

  // Exposed instead of the owner id, since the reader's own id never leaves the server.
  @Field(() => Boolean, { nullable: false })
  canChangeVisibility: boolean;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
