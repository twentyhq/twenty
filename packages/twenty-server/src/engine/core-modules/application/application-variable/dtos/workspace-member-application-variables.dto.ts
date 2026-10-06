import { Field, ObjectType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationVariableUserValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable-user-value.dto';

@ObjectType('WorkspaceMemberApplicationVariables')
export class WorkspaceMemberApplicationVariablesDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  workspaceMemberId: string;

  @Field(() => [ApplicationVariableUserValueDTO])
  variables: ApplicationVariableUserValueDTO[];
}
