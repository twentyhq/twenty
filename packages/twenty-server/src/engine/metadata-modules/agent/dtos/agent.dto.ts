import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';

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
  @Field()
  label: string;

  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @Field({ nullable: true })
  description: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  prompt: string;

  @Field(() => String)
  modelId: ModelId;

  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat: object;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @IsBoolean()
  @Field()
  isCustom: boolean;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
