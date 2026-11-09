import { Field, InputType } from '@nestjs/graphql';

import { ArrayNotEmpty, IsArray, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ArchiveInboxThreadInput')
export class ArchiveInboxThreadInputDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  threadId: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  @Field(() => [UUIDScalarType], { nullable: true })
  workspaceMemberIds?: string[];
}
