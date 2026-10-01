import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { type SendInboxMessageToolCall } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('SendInboxMessageInput')
export class SendInboxMessageInputDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  workspaceMemberId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  threadKey: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  idempotencyKey: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  text: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  toolCall?: SendInboxMessageToolCall;
}
