import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';

@InputType()
export class UpdateAgentInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsOptional()
  @Field()
  name?: string;

  @IsString()
  @IsOptional()
  @Field()
  label?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field()
  prompt?: string;

  @IsString()
  @IsOptional()
  @Field(() => String)
  modelId?: ModelId;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  responseFormat?: object;
}
