/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class GetAuthorizationUrlForSSOInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  identityProviderId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceInviteHash?: string;
}
