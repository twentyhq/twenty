import { Field, HideField, ObjectType } from '@nestjs/graphql';

import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('Agent')
export class AgentDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field({ nullable: true })
  description: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  prompt: string;

  @Field(() => String)
  modelId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat: object;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
