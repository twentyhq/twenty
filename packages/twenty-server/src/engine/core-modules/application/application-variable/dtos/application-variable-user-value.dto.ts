import { Field, ObjectType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationVariableUserValue')
export class ApplicationVariableUserValueDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  workspaceMemberId: string;

  @IsString()
  @Field()
  value: string;
}
