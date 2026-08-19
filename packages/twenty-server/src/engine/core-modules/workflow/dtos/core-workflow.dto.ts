import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('CoreWorkflowDTO')
export class CoreWorkflowDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  applicationName: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceWorkflowId: string | null;

  @Field(() => String)
  updatedAt: string;
}
