import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class RevokeWorkspaceCreditGrantInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  creditGrantId: string;
}
