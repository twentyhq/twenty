import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';

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
  lastPublishedCoreWorkflowVersionId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceWorkflowId: string | null;

  @Field(() => Boolean, { nullable: false })
  isSystem: boolean;

  @Field(() => Boolean, { nullable: false })
  isPrivate: boolean;

  // Exposed instead of the owner id, since the reader's own id never leaves the server.
  @Field(() => Boolean, { nullable: false })
  canChangeVisibility: boolean;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
