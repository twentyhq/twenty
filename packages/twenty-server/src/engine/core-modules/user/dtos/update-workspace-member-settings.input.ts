import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWorkspaceMemberSettingsInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  workspaceMemberId: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  update: Record<string, unknown>;
}
