import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const QUEUE_NAME_MAX_LENGTH = 100;

@InputType()
export class CreateInboxQueueInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(QUEUE_NAME_MAX_LENGTH)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field(() => [UUIDScalarType], { nullable: true })
  @IsOptional()
  @IsArray()
  memberWorkspaceMemberIds?: string[];
}

@InputType()
export class UpdateInboxQueueInput {
  @Field(() => UUIDScalarType)
  queueId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(QUEUE_NAME_MAX_LENGTH)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;
}

@InputType()
export class SetInboxQueueMembersInput {
  @Field(() => UUIDScalarType)
  queueId: string;

  @Field(() => [UUIDScalarType])
  @IsArray()
  memberWorkspaceMemberIds: string[];
}

@InputType()
export class SetInboxItemTypeDefaultQueueInput {
  @Field(() => UUIDScalarType)
  inboxItemTypeId: string;

  // Null sends this kind of work back to the triage queue.
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  defaultQueueId?: string | null;
}
