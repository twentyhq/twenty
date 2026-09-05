import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { INBOX_QUEUE_NAME_MAX_LENGTH } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateInboxQueueInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(INBOX_QUEUE_NAME_MAX_LENGTH)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field(() => [UUIDScalarType], { nullable: true })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}

@InputType()
export class UpdateInboxQueueInput {
  @Field(() => UUIDScalarType)
  queueId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(INBOX_QUEUE_NAME_MAX_LENGTH)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;
}

@InputType()
export class SetInboxQueueRolesInput {
  @Field(() => UUIDScalarType)
  queueId: string;

  @Field(() => [UUIDScalarType])
  @IsArray()
  roleIds: string[];
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
