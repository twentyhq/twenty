import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('SendInboxMessageInput')
export class SendInboxMessageInputDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  @Field(() => [UUIDScalarType])
  workspaceMemberIds: string[];

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
  toolCall?: unknown;
}
