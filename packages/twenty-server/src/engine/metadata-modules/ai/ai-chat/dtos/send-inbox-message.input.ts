import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { InboxMessageRecordTargetInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/inbox-message-record-target.input';

@InputType('SendInboxMessageInput')
export class SendInboxMessageInputDTO {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Field(() => [UUIDScalarType], { nullable: true })
  workspaceMemberIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Field(() => [UUIDScalarType], { nullable: true })
  mentionedWorkspaceMemberIds?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true })
  threadKey?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  threadId?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  channelId?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  idempotencyKey: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field({ nullable: true })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  text: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  toolCall?: unknown;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InboxMessageRecordTargetInputDTO)
  @Field(() => [InboxMessageRecordTargetInputDTO], { nullable: true })
  recordTargets?: InboxMessageRecordTargetInputDTO[];
}
