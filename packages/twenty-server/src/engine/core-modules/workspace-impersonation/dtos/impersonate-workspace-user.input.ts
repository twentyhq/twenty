import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class ImpersonateWorkspaceUserInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  targetUserWorkspaceId: string;
}

@ArgsType()
export class ImpersonateWorkspaceMemberInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  targetWorkspaceMemberId: string;
}
