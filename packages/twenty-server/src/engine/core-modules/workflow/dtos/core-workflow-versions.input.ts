import { ArgsType, Field } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class CoreWorkflowVersionsArgs {
  @Field(() => UUIDScalarType)
  @IsUUID()
  workspaceWorkflowId: string;
}
